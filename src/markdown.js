// Markdown → HTML (GFM). Extras: $…$ and $$ math (math.js); tables get a horizontally scrolling wrapper and opt in to sort / filter
// with a following {table ...} line; status words in cells render as badges; an image on its own line becomes a captioned figure;
// raw HTML is filtered (see raw-html.js): a placeholder such as <host> shows as text, tags that break the page are escaped, event handlers and javascript: links are removed.

import { Marked } from 'marked';
import { filterBlocks, filterInline } from './raw-html.js';
import { mathExtension } from './math.js';
import { parseAttrs } from './attrs.js';
import { esc } from './svg/text.js';

// What the raw-HTML filter changed while collectHtmlNotes is running. Rendering is synchronous, so nothing leaks between calls.
let sink = null;
const note = (at, message) => sink?.push({ at, message });

// Whether $ starts a formula (src/math.js). A video draft turns it off: scenes have no math styles.
let mathOn = true;

// Runs render() and returns its result with the notes about the raw HTML it changed: [{ at, message }], at being the tag as the draft wrote it.
// A formula that Temml cannot read adds a note too, { at, message, math: true }, at being the formula as the draft wrote it.
export function collectHtmlNotes(render, { math = true } = {}) {
  const outer = sink;
  const outerMath = mathOn;
  const notes = [];
  sink = notes;
  mathOn = math;
  try {
    return { result: render(), notes };
  } finally {
    sink = outer;
    mathOn = outerMath;
  }
}

const marked = new Marked({ gfm: true });
// parseInline reads one run of inline text and hands the hook inline tokens, so it gets its own parser.
const inline = new Marked({ gfm: true });

const TABLE_ATTR = /^\{table\s+([^{}]*)\}$/;
let tableUi;
let tableInteractive = true;

// A {table ...} line immediately after a table configures that table. Marked reads an unseparated line as a final row;
// a line after a blank is a paragraph. parseAttrs keeps bare flags and key=value options in one syntax, so later options
// such as widths= do not need a second parser.
function tableOptions(tokens) {
  for (let k = 0; k < tokens.length; k++) {
    const token = tokens[k];
    if (token.type === 'table') {
      const row = token.rows.at(-1);
      const rowOption = row?.[0]?.text.trim().match(TABLE_ATTR);
      const rowMatch = rowOption && row.length > 1 && row.slice(1).every((cell) => !cell.text.trim()) && rowOption;
      const nextIndex = tokens.findIndex((candidate, index) => index > k && candidate.type !== 'space');
      const next = tokens[nextIndex];
      const paragraphMatch = next?.type === 'paragraph' && next.text.trim().match(TABLE_ATTR);
      const match = rowMatch || paragraphMatch;
      if (match) {
        const options = parseAttrs(match[1]);
        if (['sort', 'filter'].some((flag) => options[flag] === true)) {
          token.amTable = options;
          if (rowMatch) token.rows.pop();
          else tokens.splice(nextIndex, 1);
        } else {
          note(match[0], 'unrecognized table option; use {table sort}, {table filter}, or {table sort filter}');
        }
      } else if (rowOption && !['sort', 'filter'].some((flag) => parseAttrs(rowOption[1])[flag] === true)) {
        note(rowOption[0], 'unrecognized table option; use {table sort}, {table filter}, or {table sort filter}');
      }
    } else if (token.type === 'list') {
      token.items.forEach((item) => tableOptions(item.tokens));
    } else if (token.type === 'blockquote') {
      tableOptions(token.tokens);
    }
  }
  return tokens;
}

marked.use({ hooks: { processAllTokens: (tokens) => filterBlocks(tableOptions(tokens), { lex: (source) => tableOptions(marked.lexer(source)), note }) } });
inline.use({ hooks: { processAllTokens: (tokens) => filterInline(tokens, note) } });
marked.use({ extensions: [{
  name: 'table',
  renderer(token) {
    if (!tableInteractive || !token.amTable) return false;
    const flags = ['sort', 'filter'].filter((flag) => token.amTable[flag] === true);
    if (!flags.length) return false;
    const table = this.parser.renderer.table(token).replace('<table>', `<table data-am-table="${flags.join(' ')}">`);
    if (!token.amTable.filter) return table;
    const label = esc(tableUi?.filter ?? 'Filter table');
    return `<div class="am-table-controls" hidden><label class="am-table-filter"><span>${label}</span><input type="search" data-am-table-filter aria-label="${label}"></label></div>${table}`;
  },
}] });
const math = mathExtension({ enabled: () => mathOn, note: (at, message) => sink?.push({ at, message, math: true }) });
marked.use(math);
inline.use(math);

const STATUS = {
  ok: {
    cls: 'ok',
    icon: '<svg class="ico" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  },
  no: {
    cls: 'no',
    icon: '<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  },
  warn: {
    cls: 'warn',
    icon: '<svg class="ico" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  },
};
const STATUS_ALIAS = { '✓': 'ok', '✔': 'ok', '✗': 'no', '✘': 'no', '⚠': 'warn' };

export function statusHtml(word, label = '') {
  const kind = STATUS[STATUS_ALIAS[word] ?? word];
  if (!kind) return null;
  const text = label.trim();
  return `<span class="am-status am-status--${kind.cls}"><span class="am-status-icon" aria-hidden="true">${kind.icon}</span>${text ? `<span class="am-status-text">${text}</span>` : ''}</span>`;
}

// A paragraph that holds only an image becomes a figure; the alt text is its caption.
const IMAGE_ONLY = /<p>\s*(<img\b[^>]*>)\s*<\/p>/g;

// The status word must open the cell (even if accidentally wrapped in <code> or <strong>); the label after it may hold inline HTML.
const CELL_STATUS = /<td([^>]*)>\s*(?:<(?:code|strong|b)>\s*)?(ok|no|warn|✓|✔|✗|✘|⚠)(?:\s+((?:(?!<\/?td\b)[\s\S])*?))?(?:\s*<\/(?:code|strong|b)>)?\s*<\/td>/g;

function figure(img) {
  const alt = img.match(/\salt="([^"]*)"/)?.[1];
  return `<figure class="am-figure">${img}${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
}

function decorate(html) {
  return html
    .replace(/<table data-am-table=/g, '<div class="am-table-wrap"><table data-am-table=')
    .replace(/<table>/g, '<div class="am-table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>')
    .replace(IMAGE_ONLY, (_, img) => figure(img))
    .replace(CELL_STATUS, (_, attrs, word, label = '') => `<td${attrs}>${statusHtml(word, label)}</td>`)
    .replace(/<td([^>]*)>([\s\S]*?)\s+\/\/\s+([\s\S]*?)<\/td>/g, (_, attrs, pri, sec) => {
      let p = pri.trim();
      let colorStyle = '';
      const toneMatch = p.match(/^\[(ok|err|warn|accent)\]\s*(.*)$/);
      if (toneMatch) {
        colorStyle = ` style="color:var(--${toneMatch[1]})"`;
        p = toneMatch[2];
      } else if (/^(省\s*\$|✓|\+\$)/.test(p)) {
        colorStyle = ' style="color:var(--ok)"';
      } else if (/^(多花\s*\$|亏损|\-\$)/.test(p)) {
        colorStyle = ' style="color:var(--err)"';
      }
      return `<td${attrs}><span class="pri-title"${colorStyle}>${p}</span><span class="sec-note">${sec.trim()}</span></td>`;
    });
}

// CommonMark takes a space in a link destination only inside <…>, so marked would leave ![alt](a b.png) as text. Wrap such a destination; code spans are skipped.
// A destination may hold balanced (…) such as "Screenshot (1).png".
const SPACED_IMAGE = /(`[^`\n]*`)|(!\[[^\]\n]*\]\()\s*((?:[^()<>"\n]|\([^()<>"\n]*\))*?)(\s+"[^"\n]*")?\s*\)/g;

function wrapSpacedImages(text) {
  return text.replace(SPACED_IMAGE, (whole, code, head, dest, title = '') => (code || !/\s/.test(dest) ? whole : `${head}<${dest}>${title})`));
}

export function md(text, { ui, interactive = true } = {}) {
  const outerUi = tableUi;
  const outerInteractive = tableInteractive;
  tableUi = ui?.table;
  tableInteractive = interactive;
  try {
    return decorate(marked.parse(wrapSpacedImages(String(text ?? ''))));
  } finally {
    tableUi = outerUi;
    tableInteractive = outerInteractive;
  }
}

export function mdInline(text) {
  return inline.parseInline(wrapSpacedImages(String(text ?? '')));
}

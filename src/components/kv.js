import { mdInline } from '../markdown.js';
import { esc } from '../svg/text.js';
import { ComponentError, contentLines } from './error.js';
import { parseAttrs } from '../attrs.js';

const ICONS = {
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  dollar: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  server: '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
};

const TONES = new Set(['ok', 'err', 'warn', 'accent']);

export default {
  name: 'kv',
  summary: 'Key-value grid / Hero KPI cards',
  syntax: `\`\`\`kv [cols=4]
key: value
key: value | subtitle | [ok|err|warn|accent] | [clock|zap|dollar|alert|check|flame|server|shield|sparkles|chart]
* wide key: value   ← starts with *: spans the full row, larger text
\`\`\`
- Splits at the first colon (: or fullwidth ：); optional | pipes add a muted subtitle, semantic color tone, and Lucide SVG icon.`,
  example: '```kv cols=4\n保底缓存时间: 5 分钟 | 3 分钟内命中率 99.2% | accent | clock\n总缓存命中率: 94.8% | 3.61 亿字命中 | ok | zap\n```',
  render(text, { args }) {
    const parsed = parseAttrs(args).cols;
    const value = Number(parsed);
    if (Number.isFinite(value) && !Number.isInteger(value)) {
      throw new ComponentError(`kv cols must be a whole number from 1 to 6, not "${parsed}"`, 0);
    }
    const cols = Math.max(1, Math.min(value || 2, 6));
    const lines = contentLines(text);
    if (!lines.length) throw new ComponentError('kv needs at least one key: value line', 1);

    const hasHero = lines.some(({ text: t }) => t.includes('|'));
    if (hasHero) {
      const cards = lines.map(({ text: t, line }) => {
        const wide = t.startsWith('*');
        const body = wide ? t.slice(1).trim() : t;
        const m = body.match(/^([^:：]+)[:：]\s*(.*)$/);
        if (!m) throw new ComponentError(`kv line has no colon: "${t}"; expected key: value`, line);
        const parts = m[2].split('|').map((s) => s.trim());
        const mainVal = parts[0] ?? '';
        const subText = parts[1] ?? '';
        const tone = TONES.has(parts[2]) ? parts[2] : '';
        const iconKey = ICONS[parts[3]] ? parts[3] : (ICONS[parts[2]] ? parts[2] : '');
        const iconTone = tone || 'accent';
        const iconHtml = iconKey
          ? `<span class="hero-icon-box" style="background:var(--${iconTone}-bg); color:var(--${iconTone});"><svg class="ico ico-lg" viewBox="0 0 24 24">${ICONS[iconKey]}</svg></span>`
          : '';
        return `<div class="hero-card"${wide ? ' style="grid-column: 1 / -1"' : ''}><div class="hero-top"><span class="hero-label">${esc(m[1].trim())}</span>${iconHtml}</div><div class="hero-val${tone ? ` hero-val--${tone}` : ''}">${mdInline(mainVal)}</div>${subText ? `<span class="hero-sub">${mdInline(subText)}</span>` : ''}</div>`;
      });
      return `<div class="hero-grid" style="grid-template-columns: repeat(${cols}, minmax(0, 1fr))">${cards.join('')}</div>`;
    }

    const cells = lines.map(({ text: t, line }) => {
      const wide = t.startsWith('*');
      const body = wide ? t.slice(1).trim() : t;
      const m = body.match(/^([^:：]+)[:：]\s*(.*)$/);
      if (!m) throw new ComponentError(`kv line has no colon: "${t}"; expected key: value`, line);
      return `<div class="am-kv-cell${wide ? ' am-kv-cell--wide' : ''}"><dt>${esc(m[1].trim())}</dt><dd>${mdInline(m[2])}</dd></div>`;
    });
    return `<dl class="am-kv" style="--kv-cols: ${cols}">${cells.join('')}</dl>`;
  },
};

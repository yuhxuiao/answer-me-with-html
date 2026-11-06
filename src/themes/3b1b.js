// 3b1b: video-only dark theme (dark ground, blue lines, yellow accents); the title floats top left with no frame.
import { serifByLanguage } from './fonts.js';

// The Latin fonts in front of a language's serif fonts, so Han characters use that language's glyphs.
const TITLE_HEAD = '"CMU Serif", "Latin Modern Roman", "Iowan Old Style", "Palatino"';

export default {
  name: '3b1b',
  summary: '3Blue1Brown dark',
  scope: ['video'],
  mode: 'dark',
  video: {
    tokens: {
      common: {
        '--bg': '#0b0f17', '--paper': 'rgba(20, 27, 40, 0.86)', '--ink': '#f0f4f8', '--ink-2': '#b0bdd0', '--ink-3': '#738299',
        '--line': '#58c4dd', '--line-2': 'rgba(88, 196, 221, 0.22)', '--fill': 'rgba(26, 35, 52, 0.72)',
        '--accent': '#f7d96f', '--accent-bg': 'rgba(247, 217, 111, 0.15)',
        '--ok': '#4ade80', '--ok-bg': 'rgba(74, 222, 128, 0.16)', '--err': '#fb7185', '--err-bg': 'rgba(251, 113, 133, 0.16)',
        '--warn': '#fbbf24', '--warn-bg': 'rgba(251, 191, 36, 0.16)', '--head-bg': '#58c4dd', '--head-fg': '#090d14',
        '--series-1': '#38bdf8', '--series-2': '#4ade80', '--series-3': '#fbbf24', '--series-4': '#fb7185', '--series-5': '#a78bfa', '--series-6': '#f472b6',
        '--radius': '12px', '--bw': '1.6px', '--shadow': '0 10px 32px rgba(0, 0, 0, 0.38)',
        '--font-sans': '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Roboto, sans-serif',
        '--font-mono': 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        '--head-font': 'var(--font-sans)',
        '--v-stage': 'radial-gradient(ellipse at 50% 22%, #17253b 0%, #0d1320 58%, #080b12 100%)',
        '--v-cap-fg': '#f8fafc', '--v-cap-bg': 'rgba(11, 16, 26, 0.82)', '--v-cap-border': 'rgba(88, 196, 221, 0.28)',
        '--v-title-font': 'var(--font-sans)',
        '--v-glow': 'drop-shadow(0 0 10px rgba(247, 217, 111, 0.65))',
      },
    },
    css: `& .amv-stage::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(rgba(88, 196, 221, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 196, 221, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0.9) 20%, transparent 78%);
}
& .amv-scene-head { left: 88px; right: 88px; top: 44px; height: 54px; border: 0; border-bottom: 1px solid rgba(88, 196, 221, 0.22); border-radius: 0; background: none; align-items: center; gap: 16px; padding-bottom: 10px; }
& .amv-scene-n { background: rgba(88, 196, 221, 0.16); color: var(--line); border: 1px solid rgba(88, 196, 221, 0.4); border-radius: 8px; padding: 4px 14px; min-width: 0; font: 700 24px var(--font-mono); }
& .amv-scene-title { padding: 0; font-weight: 700; font-size: 38px; letter-spacing: -0.01em; color: #f8fafc; }
& .amv-scene-meta { font-size: 15px; color: var(--line); opacity: 0.8; }
& .amv-title { font-weight: 800; font-size: 86px; letter-spacing: -0.02em; background: linear-gradient(135deg, #ffffff 30%, #7dd3fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
& .amv-subtitle { color: var(--line); font-weight: 500; font-size: 34px; }
& .amv-titleblock { display: none; }
& .amv-caption { bottom: 32px; }
& .amv-caption span { backdrop-filter: blur(12px); box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55); font-size: 34px; padding: 12px 32px; border-radius: 14px; }`,
    // Right-to-left: the floating title keeps its 96 px inset on the side it starts from.
    rtlCss: '& .amv-scene-head { left: 72px; right: 96px; }',
  },
};

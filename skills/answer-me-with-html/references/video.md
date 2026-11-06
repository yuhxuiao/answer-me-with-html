# Explainer videos (am video, 3Blue1Brown style)

Read this when SKILL.md section 7 sends you here. `am` means the full `node ".../scripts/am.mjs"` command from SKILL.md section 2; write the path out in full, because `${CLAUDE_SKILL_DIR}` is not replaced in this file.

A video draft has the same format as a page draft, with one extra rule: lines starting with `>` are narration, one beat per line.

````bash
am video - --no-open <<'AM_EOF'
---
title: The TCP three-way handshake
subtitle: Why three
---
> Opening narration (optional).

## Both ends are waiting
```sequence
Client -> Server: SYN
Server -> Client: SYN-ACK
Client -> Server: ACK
```
> First the client sends SYN to ask for a connection.
> [Server] answers with SYN-ACK.
> The client replies with ACK, and the connection is open.
AM_EOF
````

- One `## ` is one scene. To make every scene visually rich (like a Motion-Graphics Bento dashboard rather than a bare single chart), combine **a top `kv cols=4` Hero KPI row** (`标签: 数值 | 副标题 | [ok|err|warn|accent] | [clock|zap|dollar|alert|shield]`) with **a diagram (`flow LR`, `chart pie`, `chart bar horizontal`) or a dual-layer `主结论 // 次要说明` table** in the same scene!
- **Semantic Audio-Visual Sync Rule (`[name]` 1-to-1 Alignment)**:
  - The video engine binds each visual step (each Hero KPI card, flowchart branch, chart row, or table row) directly to the `[name]` tag in your `> ` narration lines, calculating the exact intra-sentence spoken timestamp (`beat.start + charOffsetRatio * duration`)!
  - Therefore, **every visual item in a scene MUST have a corresponding `[name]` in the narration in the exact order the items appear on screen**. You may put multiple `[name]` tags in a single narration sentence (e.g., `保底缓存 [5 分钟]，命中率 [94.8%]，帮你省下 [$1,102.32]，未命中仅多花 [$38.25]。`) — as the voice speaks each `[name]`, that card/bar/node pops in, receives the glowing gold spotlight, and lights up in the subtitle simultaneously!
  - In `flow LR`, write the branches in the same order your narration walks through them so top-to-bottom visual order matches the spoken order.
- Nodes with the same name in adjacent scenes move smoothly to their new position. To keep the viewer following one object, reuse the same name in the next scene.
- 3–6 scenes per video, one or two sentences per narration line.
- Narration is read aloud, so write it as speech, as if explaining to someone face to face: transitions like `你看`, `那问题来了`, `我们换个角度看` are fine, and characters' "lines" go in quotes. Do not write it like a manual (`客户端发送 SYN 报文以请求建立连接`). Sentence length is still subject to the STE check.
- The look follows the theme in the settings by default (usually the blueprint drawing style). When the user wants "that dark 3b1b style", write `theme: 3b1b` in the frontmatter.
- Narration voice: the default is `--voice auto`: ElevenLabs when `ELEVENLABS_API_KEY` is set, otherwise system TTS (macOS say), and subtitles only when neither is available. When the user says "no sound", add `--voice off`. When the user runs a local OpenAI-compatible speech service and has set `AM_TTS_URL`, use `--voice local`.
- Ready-made narration: `--audio-map lines.json` takes a JSON object from narration line to audio file, such as `{"First the client sends SYN.":"audio/01.mp3"}`. Relative audio paths start at the map file's folder; keys ignore `> `, `[ ]` markers and extra whitespace. Non-WAV files need ffmpeg. Every narration line needs a key and every file must exist. Use `--audio-map` without `--voice`: the two explicit options conflict, while a configured default voice is ignored when a map is given.
- The output is a single-file player page under `~/.answer-me-with-html/videos/` (audio embedded). The player carries a chapter strip above the controls (a chip jumps into that scene), a speed button (0.5× to 2×) and an export button (⤓) that encodes the same video in the browser and downloads it, with the progress on the button. When the user wants a video file next to the page, add `--mp4` for an MP4 (needs ffmpeg, about 1.3 times the video length). Without ffmpeg, add `--webm` instead: the page encodes a WebM (VP9 + Opus) itself; its time depends on how much of the page moves (measured: 28 s for an 11-second draft, 13.5 minutes for a 2:27 explainer). Both need Chrome and Node.js 22+. The export button needs a secure context (a local file or `localhost`): WebCodecs is not available to a page served over plain HTTP. The player page grows by about 19 KB for this.
- Full syntax: `am help video`. In the terminal, reply with one sentence plus the player page link (and the MP4 link), written as in step 5 of section 2 of SKILL.md.

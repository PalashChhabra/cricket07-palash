# Cricket 07 — The Micky Edit

A personal landing page, playable browser shell, source download and AI customization kit by Micky Kharbanda. Instagram: [@whymickywhy](https://www.instagram.com/whymickywhy/). X: [@mickykharbanda](https://x.com/mickykharbanda). Work: [Clearlyy](https://clearlyy.io).

This extends [Dhaiwat Pandya's Cricket 07 browser port](https://github.com/Dhaiwat10/cricket07-browser). The complete upstream source is retained in `engine/`, including its build instructions, licenses and contributor credits. The original browser port and recompilation are not Micky's original work. The additions here are the modern squad/kit pack, browser save-file tools, installation fixes, personal page and customization prompts.

## What's here

- `site/`: responsive landing page and browser launcher. The public launcher imports the visitor's own game files; it does not download an original EA game archive.
- `engine/`: the upstream translator, host, runtime and build tools, pinned by the included source snapshot.
- `mods/modern-2026/`: eleven teams, 200 distinct player records, native-resource manifest, fan kit sources and official squad-reference snapshots.
- `mod-tools/`: archive/texture helpers and roster builder. The builder reads `game/Data/data.gob` from your own copy. Python dependencies: Pillow (DDS encoding), CairoSVG and a working Cairo library.
- `tools/`: publication packaging and local serving.
- `content/`: copyable prompts and local-play instructions.

Original EA executables, Data/Audio archives, generated game C code and compiled WebAssembly are not included in the source repository or source ZIP. The separately hosted browser-build ZIP includes the prebuilt runtime and mod resources, with the game files still supplied by the player. Do not mistake the upstream MIT license for a license to redistribute EA's commercial game assets or team/player trademarks.

## Play

Use a desktop/laptop with keyboard/controller and a WebGPU-capable browser. Import a compatible Cricket 07 game folder once. Files remain local to that browser. For the modern pack, find India ODI 2026 and the IPL teams in **Other**. OG India remains in **International**. Eleven A-team/invitational slots are repurposed in expanded mode; Original teams restores every secondary side too.

Native save files are retained locally with backup/restore controls. There is no instant save-state system or new save-anywhere feature. The public edition is solo/local play; upstream multiplayer requires deploying its own room service. Do not expose the local tunnel server or proxy someone else's assets or signaling endpoint as a substitute.

## Build the site

First build a compatible browser runtime from your own game executable by following `engine/README.md`. Then:

```sh
python3 tools/build_site.py --runtime /path/to/compiled/build
python3 tools/serve.py --directory dist --port 8086
```

Open http://localhost:8086. The build creates `dist/`, a source ZIP, all prompts as Markdown and a separate ready-to-run browser-build ZIP. It uses an allowlist and rejects original game archives/executables and secret-file names. The source ZIP retains the complete upstream MIT license and the original engine source. The original game is never included.

To edit the roster, put your own original archive at `game/Data/data.gob`, then run `python3 mod-tools/build_modern_2026.py` in a Pillow/CairoSVG environment. Never overwrite the original archive. The builder checks 943 protected OG player records and 52 protected squads. Fan-created kits and proxy/generic player abilities do not claim authentic 2026 faces or official ratings. Old commentary/stadiums remain.

```sh
node --test mod-tools/workers.test.cjs
```

These checks cover archive restoration, pack upgrades, rejected corrupt downloads, installer resuming and quota recovery. A live-match smoke test does not prove every tour or tournament is compatible.

## Publish to Netlify

Publish **only `dist/`**, never the surrounding OYT workspace or the original game folder. `netlify.toml` sets the cross-origin isolation headers required by WebAssembly threads and WebGPU. The landing page is mobile-friendly; the game has no touch controls. Build locally, then use `netlify deploy --dir=dist --no-build` for a preview and `--prod` after verification. Keep `.netlify/` and credential files untracked. This manual build does not need a server, database, analytics account, email gate or private API keys.

Netlify's standard hostname is `cricket07-whymickywhy.netlify.app`. A nested name such as `cricket07.whymickywhy.netlify.com` is not a normal Netlify site hostname. For a custom nested hostname, use a domain you own and configure DNS. For high traffic, review hosting bandwidth/credit usage before adding large automatic game downloads.

## AI prompts

See `content/CUSTOMIZE-WITH-AI.md`. These starter prompts were written for this customization kit. They are not transcripts of how the original game or browser port was created. Use a coding assistant with file access, supply accurate player/reference data, preserve OG teams, and test changes in an actual match.

## Credits

- Cricket 07 / EA Sports: Electronic Arts, not affiliated with or sponsoring this project.
- Browser port and upstream open-source software: Dhaiwat Pandya and contributors. Its README credits Stephan Cilliers for the Rugby 06 scheduler/netplay port and controller support.
- This edition's page and customizations: Micky Kharbanda.
- Squad sources: BCCI's October 2026 ODI announcement and official IPL 2026 team endpoints, recorded in the mod manifest/reference snapshots.
- Bricolage Grotesque and DM Sans: open fonts; licenses are in `LICENSES/`.

Keep the included upstream `LICENSE` with all redistributed code. The source bundle is MIT-licensed for code; game data, trademarks, public reference imagery and the compiled game-specific runtime have their own ownership. No promise is made of compatibility with every game release or existing mod.

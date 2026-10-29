# Cricket 07 — IPL 2026 online play and realistic batting: technical gate

## Product contract
- Preserve upstream browser gameplay, local install/cache, controller support, and private friend rooms.
- Support the same modern-2026 pack for both peers: India ODI 2026 and all ten IPL teams.
- Make batting timing and shot selection more challenging, inspired by A Unit Studios Cricket 2012, but do not claim identical physics until its changes are examined.
- Keep original squads reversible; do not modify the user's original game files.
- Modern stadiums, kits, and commentary are separate compatibility milestones, not presumed complete.

## Verified from repository source (2026-10-29)
- `engine/host/netplay.c` implements deterministic lockstep, input delay, up to four slots, and periodic state-hash desync detection.
- `engine/web/loader.js` supports `?netplay=` and `?join=`; `engine/server/README.md` documents Cloudflare Workers/Durable Objects.
- `mods/modern-2026/README.md` explicitly says **online multiplayer uses Original teams**. This is the primary blocker.
- The modern pack repurposes eleven secondary teams, with 200 distinct player records and ten IPL teams; original stadiums and commentary remain.
- `README.md` says the compiled WebAssembly runtime and EA game assets are not in source. Its public launcher downloads about 1.17 GB.

## Gate 1 — IPL netplay (no changes to gameplay yet)
1. Trace mode selection, archive patch worker, OPFS install marker, and game startup in `site/` and `engine/web/`.
2. Determine why modern mode is disabled for netplay: checksum/version matching, save isolation, asset-loading timing, and deterministic simulation.
3. Require identical manifest/build IDs on both peers before entering the room. Reject mismatches with a clear error; never silently fall back to OG.
4. Ensure both peers apply the same verified modern patch before boot, with fresh netplay saves and identical selected roster mode.
5. Add automated tests for matching/mismatching manifests and patch mode negotiation.
6. Test a complete IPL-vs-IPL match on two separate browsers, including reconnection/quit and desync checks.

**Exit criteria:** both peers play a complete IPL match without state-hash divergence, using the same verified 2026 squad data.

## Gate 2 — Realistic batting
1. Obtain the Cricket 2012 patch through an authorised source and inspect it offline without executing untrusted Windows installers.
2. Diff player records, AI configuration, data archives and (if lawfully available) executable logic against a compatible original build.
3. Separate verified gameplay changes from cosmetic/roster changes.
4. Implement a deterministic, versioned batting-difficulty profile shared by both peers.
5. Measure boundary/six frequency, mistimed shots, wickets, timing windows, difficulty levels and bowling outcomes over repeatable input sequences.
6. Preserve an OG difficulty toggle for A/B comparison; test netplay state hashes.

**Exit criteria:** repeatable harder batting in solo and online modes; no unverified claim of exact Cricket 2012 behaviour.

## Gate 3 — 2025/2026 content quality
- Audit 10 IPL squads against dated official sources, distinguish 2025 from 2026, verify team slots and 20-player cap.
- Replace generic ability templates with transparent, data-driven estimates; do not label them official ratings.
- Verify stadium replacement compatibility independently; preserve fallbacks and avoid inventing new commentary.
- Test representative formats and tournaments beyond a single exhibition match.

## Restrictions and current limitations
- No browser gameplay, native build, or two-device match has been executed as part of this audit.
- Source-code licensing does not authorise redistribution of EA game files or third-party patch assets.
- Do not run flagged or unknown executables, commit proprietary assets, or deploy without rights review.


## Implementation progress (source-only, 2026-10-29)
- `site/play/roster.js`: modern squads no longer disable the multiplayer launcher; roster identity is `modern-2026:<pack sha256>` or `original`.
- `site/play/c07.js`: includes roster identity in the game version handshake; supports `?netplay=<worker-url>` and propagates that URL into friend invitations; locks roster selection after joining a room.
- `engine/server/worker.js`: room lobby includes a compatibility boolean and rejects missing or mismatched versions at start.
- **Not yet tested in browser:** a Cloudflare Worker must be deployed with `NETPLAY_SECRET`, and both players must use the same build, game files and modern pack.

### Two-browser validation procedure
1. Build a compatible browser runtime and game assets from authorised local copies, using `README.md`. Do not put commercial game assets into the source repository.
2. Deploy `engine/server/` to a Cloudflare account and set `NETPLAY_SECRET`; use an explicit `ALLOWED_ORIGINS` value for the game site's HTTPS origin.
3. Host the built `dist/` with COOP/COEP headers. Open `/play/?netplay=https://YOUR-WORKER.workers.dev` on both computers.
4. On both computers select `OG + India 2026 + IPL teams`, create a room, share its invite, and verify the host can start.
5. Deliberately select Original teams on the second computer; confirm the host sees the mismatch and cannot start.
6. Rejoin with the same roster pack, start a CSK-vs-MI match and play through the innings; check for desync indicators, input delay, and player/kit correctness.
7. Repeat after reloading both browsers and with different network connections; do not label multiplayer stable until these checks pass.

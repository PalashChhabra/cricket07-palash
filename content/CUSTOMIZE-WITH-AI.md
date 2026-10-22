# Customize Cricket 07 with a coding assistant

Download the project ZIP, extract it and open that folder in Claude Code, Codex or another file-editing coding assistant. Fill in the brackets. These starter prompts describe the changes you can make; they are not a transcript of how the original port was built.

## Your own team

```text
Help me customize this Cricket 07 browser project.

I want a team called [TEAM NAME], with these players: [PLAYER NAMES AND ROLES].

Read README.md, the upstream engine/README.md, and mod-tools/build_modern_2026.py first. Preserve OG India and every protected original squad. Reuse only an explicitly chosen secondary XI or A-team slot; do not replace a senior national team. Give modern players separate IDs and keep original-mode saves separate.

Update the team plan, captain, squad, abbreviations and kit references. Rebuild from my own game files. Check the protected records, test switching to Original teams, and verify the team in an actual match. Label proxy ratings and generic faces honestly. Explain the finished changes in plain English.
```

## Your own kit

```text
Help me make a new kit for [TEAM NAME] in this Cricket 07 browser project.

Use [COLOURS], [SPONSOR TEXT] and the reference images I supply. Read mod-tools/fsh.py and the vector_texture function before editing.

Keep OG uniforms unchanged. Edit the modern kit source, including shirt, trousers, pads, keeper equipment, hat and helmet. Respect the game's texture layout. Preserve each native FSH header, texture key, mip tail and attachment when replacing pixels.

Build from my own game files. Verify the result on a player in a live match, including front/back text orientation and equipment colours. Call it a fan recreation unless I provide an official licensed skin. Include a screenshot and the changed source files.
```

## Your own page

```text
Help me personalize this Cricket 07 project page.

My name is [NAME]. My Instagram is [URL], my X is [URL], and my work is [SHORT BIO + WEBSITE]. Use only the details I give you.

Read README.md and site/ before editing. Keep the game launcher, downloads, prompts, roster explorer and required original-project credits working. Preserve the upstream MIT license. Do not include private files or credentials. Keep the hosted resource manifest and resumable automatic download flow working. Keep the explicitly supplied original EXE separate from the MIT-licensed source.

Create a distinctive responsive design with readable type, keyboard access and reduced-motion support. Run tools/build_site.py with a compatible compiled runtime, check desktop and mobile, test every download and copy button, and report the actual deployment URL only after it is verified.
```


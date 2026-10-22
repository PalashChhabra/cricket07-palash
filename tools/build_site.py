#!/usr/bin/env python3
"""Build the public site from an explicit allowlist. Never copy game/ or secrets."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SOURCE_PATHS = ['README.md', 'LICENSE', 'LICENSES', '.gitignore', 'netlify.toml', 'site', 'tools', 'mod-tools', 'mods', 'engine', 'content']
FORBIDDEN_SUFFIXES = {'.exe', '.gob', '.big', '.viv', '.vp6', '.wasm', '.pyc'}
EXCLUDED_NAMES = {'.git', '.netlify', '__pycache__', '.DS_Store', 'dist', 'node_modules'}

def source_files():
    for name in SOURCE_PATHS:
        path = ROOT / name
        candidates = sorted(path.rglob('*')) if path.is_dir() else [path]
        for file in candidates:
            if not file.is_file():
                continue
            rel = file.relative_to(ROOT)
            if any(part in EXCLUDED_NAMES for part in rel.parts) or any(part.startswith('.env') for part in rel.parts):
                continue
            if file.suffix.lower() in FORBIDDEN_SUFFIXES or rel.parts[:3] == ('site', 'play', 'build'):
                continue
            yield file, rel

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--runtime', required=True, type=Path, help='Directory containing your compiled cricket07.js and cricket07.wasm')
    args = parser.parse_args()
    runtime = args.runtime.resolve()
    for name in ['cricket07.js', 'cricket07.wasm']:
        if not (runtime / name).is_file():
            parser.error(f'Missing compiled runtime: {runtime / name}')
    if DIST.exists():
        for child in DIST.iterdir():
            if child.is_dir(): shutil.rmtree(child)
            else: child.unlink()
    else:
        DIST.mkdir()
    shutil.copytree(ROOT / 'site', DIST, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.DS_Store', '__pycache__', 'build'))
    build = DIST / 'play/build'
    build.mkdir(parents=True)
    for name in ['cricket07.js', 'cricket07.wasm']:
        shutil.copy2(runtime / name, build / name)
    for license_file in (ROOT / 'LICENSES').glob('*.txt'):
        shutil.copy2(license_file, DIST / 'assets/fonts' / license_file.name)
    target = DIST / 'play/mods/modern-2026'
    target.mkdir(parents=True)
    for name in ['manifest.json', 'modern-pack.bin']:
        shutil.copy2(ROOT / 'mods/modern-2026' / name, target / name)
    manifest = json.loads((target / 'manifest.json').read_text())
    payload = (target / 'modern-pack.bin').read_bytes()
    assert len(payload) == manifest['size'] and hashlib.sha256(payload).hexdigest() == manifest['sha256']
    for resource in manifest['resources']:
        body = payload[resource['offset']:resource['offset'] + resource['size']]
        assert hashlib.sha256(body).hexdigest() == resource['sha256']
    downloads = DIST / 'downloads'
    downloads.mkdir()
    shutil.copy2(ROOT / 'LICENSE', downloads / 'LICENSE.txt')
    prompts = json.loads((ROOT / 'site/prompts.json').read_text())
    prompt_markdown = '# Customize Cricket 07 with a coding assistant\n\nDownload the project ZIP, extract it and open that folder in Claude Code, Codex or another file-editing coding assistant. Fill in the brackets. These starter prompts describe the changes you can make; they are not a transcript of how the original port was built.\n\n'
    for key, title in [('team', 'Your own team'), ('kit', 'Your own kit'), ('site', 'Your own page')]:
        prompt_markdown += f'## {title}\n\n```text\n{prompts[key]}\n```\n\n'
    (downloads / 'CUSTOMIZE-WITH-AI.md').write_text(prompt_markdown)
    (ROOT / 'content/CUSTOMIZE-WITH-AI.md').write_text(prompt_markdown)
    with zipfile.ZipFile(downloads / 'cricket07-micky-source.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for file, rel in source_files():
            archive.write(file, Path('cricket07-micky-source') / rel)
    with zipfile.ZipFile(downloads / 'cricket07-browser-build.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for file in sorted(DIST.rglob('*')):
            if file.is_file() and 'downloads' not in file.relative_to(DIST).parts:
                archive.write(file, Path('cricket07-browser-build') / file.relative_to(DIST))
        archive.write(ROOT / 'tools/serve.py', 'cricket07-browser-build/serve.py')
        archive.write(ROOT / 'content/LOCAL-PLAY.md', 'cricket07-browser-build/START-HERE.md')
        archive.write(ROOT / 'LICENSE', 'cricket07-browser-build/LICENSE')
    with zipfile.ZipFile(downloads / 'cricket07-micky-source.zip') as archive:
        assert archive.testzip() is None
        assert not any(Path(name).suffix.lower() in FORBIDDEN_SUFFIXES for name in archive.namelist())
    for file in DIST.rglob('*'):
        if file.is_file():
            assert not any(part.startswith('.env') or part in EXCLUDED_NAMES for part in file.relative_to(DIST).parts)
            assert file.suffix.lower() not in {'.exe', '.gob', '.big', '.viv', '.vp6'}
    print(f'Built {len(list(DIST.rglob("*")))} paths; verified {len(manifest["resources"])} mod resources. Original EA game files excluded.')
    for file in downloads.iterdir():
        print(f'{file.name}: {file.stat().st_size / 1e6:.1f} MB')

if __name__ == '__main__':
    main()

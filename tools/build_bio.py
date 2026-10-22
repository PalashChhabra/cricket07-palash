#!/usr/bin/env python3
"""Build Micky's lightweight standalone bio site without game binaries."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'bio-dist'
OUT.mkdir(exist_ok=True)
for child in OUT.iterdir():
    if child.is_dir(): shutil.rmtree(child)
    else: child.unlink()
shutil.copy2(ROOT / 'site/links/index.html', OUT / 'index.html')
shutil.copy2(ROOT / 'site/fonts.css', OUT / 'fonts.css')
(OUT / 'assets').mkdir()
for name in ['karan-singh.jpg', 'match.webp']:
    shutil.copy2(ROOT / 'site/assets' / name, OUT / 'assets' / name)
shutil.copytree(ROOT / 'site/assets/fonts', OUT / 'assets/fonts')
for name in ['Bricolage-Grotesque.txt', 'DM-Sans.txt']:
    source=ROOT / 'LICENSES' / name
    if source.exists(): shutil.copy2(source, OUT / 'assets/fonts' / name)
(OUT / '_headers').write_text('/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n')
print('Built standalone bio page in bio-dist/.')

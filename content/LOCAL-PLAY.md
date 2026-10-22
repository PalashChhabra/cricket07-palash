# Play your browser build locally

1. Extract this ZIP into its own folder.
2. Install Python 3 if you do not already have it.
3. In that folder, run `python3 serve.py` (Windows: `py serve.py`).
4. Open http://localhost:8086/play/ in a desktop WebGPU-capable browser.
5. The requested compatible Windows game EXE is included in `game-executable/Cricket07.exe`. Put it in a compatible game folder with your own matching Data and Audio folders, then choose that folder in the browser. Its files are copied into your browser's local storage; they are not uploaded.
6. Choose the expanded team pack or Original teams. In Team Select, use left/right to assign your keyboard to a side and change its category to Other. Use up/down for India 2026 or an IPL team.

This ZIP has the browser runtime, modern mod resources, personal page and prompts. It includes the specifically supplied game EXE, but not the matching Data/Audio archives; it is not a complete-game installer. The EXE alone does not install the 2026 teams into Windows; those are applied by the browser mod pack. The runtime is specific to the executable/build used by this port; different game releases or existing mods can be incompatible. Use the source ZIP and engine/README.md to build a matching runtime from your own copy if necessary.

Save with the game's native menus. Native save files persist in this browser and can be backed up or restored in the launcher. There is no new instant save-state or save-anywhere feature. This public build supports solo/local play. Keep the included upstream MIT license and credits when sharing code.

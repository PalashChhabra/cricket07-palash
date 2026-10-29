(() => {
  const select = document.getElementById('roster-mode');
  const status = document.getElementById('roster-status');
  const base = 'mods/modern-2026/';
  const manifest = fetch(base + 'manifest.json', { cache: 'no-store' }).then(response => {
    if (!response.ok) throw new Error('The modern team pack is unavailable.');
    return response.json();
  });
  manifest.catch(error => { status.textContent = error.message; });
  // Never carry forward the retired prototype that replaced OG India.
  const remembered = localStorage.getItem('c07-roster');
  select.value = remembered === 'original' ? 'original' : 'modern-2026';
  const update = () => {
    localStorage.setItem('c07-roster', select.value);
    document.getElementById('go-online').disabled = false;
    status.textContent = select.value === 'original'
      ? 'All OG teams, squads and uniforms. Your existing saves.'
      : 'OG India and senior teams stay. India 2026 + ten IPL teams replace the A-sides and invitational XIs under Other. New kits, separate saves; online play requires the same pack on both devices.';
  };
  select.onchange = update;
  update();
  window.C07Roster = {
    async version() {
      const mode = select.value;
      if (mode === 'original') return 'original';
      const data = await manifest;
      if (!/^[a-f0-9]{64}$/i.test(data.sha256 || '')) throw new Error('The modern-team pack has no valid SHA-256 identity.');
      return `modern-2026:${data.sha256}`;
    },
    async prepare(session) {
      const enabled = select.value === 'modern-2026';
      // Both peers must agree on the exact roster pack before the game starts.
      const data = await manifest;
      status.textContent = enabled ? 'Preparing the 2026 teams and kits…' : 'Restoring OG teams…';
      await new Promise((resolve, reject) => {
        const worker = new Worker('modern-worker.js');
        worker.onmessage = ({ data }) => { worker.terminate(); data.error ? reject(new Error(data.error)) : resolve(); };
        worker.onerror = event => { worker.terminate(); reject(new Error(event.message)); };
        worker.postMessage({ directory: 'c07game', manifest: data, enabled, base });
      });
      select.disabled = true;
      return enabled ? '/opfs/' + (localStorage.getItem('c07-modern-save-directory') || 'userdata-modern-2026-v1') : null;
    },
  };
})();

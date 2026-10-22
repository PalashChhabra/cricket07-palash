// Stream files into OPFS, retaining interrupted bytes. Verify each completed
// content-addressed chunk before advancing; cached saves are never touched.
self.onmessage = async ({ data: { base, directory, path, size, chunks } }) => {
  let handle;
  const full = () => Object.assign(new Error('Browser storage is full.'), { name: 'QuotaExceededError' });
  const digest = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  const write = (bytes, offset) => {
    let done = 0;
    while (done < bytes.length) {
      const count = handle.write(bytes.subarray(done), { at: offset + done });
      if (!count) throw full();
      done += count;
    }
  };
  try {
    let dir = await navigator.storage.getDirectory();
    dir = await dir.getDirectoryHandle(directory, { create: true });
    const parts = path.split('/');
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part, { create: true });
    handle = await (await dir.getFileHandle(parts.at(-1), { create: true })).createSyncAccessHandle();
    let offset = handle.getSize();
    if (offset > size) { handle.truncate(0); offset = 0; }
    if (offset === size) { self.postMessage({ done: true }); return; }
    let plan;
    if (chunks) {
      let expected = 0;
      for (const chunk of chunks) {
        if (chunk.offset !== expected || !Number.isSafeInteger(chunk.size) || chunk.size <= 0 || !/^[a-f0-9]{64}$/.test(chunk.sha256))
          throw new Error(`${path}: invalid hosted file manifest`);
        expected += chunk.size;
      }
      if (expected !== size) throw new Error(`${path}: incomplete hosted file manifest`);
      plan = chunks;
    } else plan = [{ path: parts.map(encodeURIComponent).join('/'), offset: 0, size }];
    self.postMessage({ bytes: offset });
    for (const chunk of plan) {
      const end = chunk.offset + chunk.size;
      if (offset >= end) continue;
      const start = offset - chunk.offset;
      const response = await fetch(new URL(chunk.path, base).href, {
        headers: start ? { Range: `bytes=${start}-` } : {}, cache: 'no-store',
      });
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
      if (response.status === 206 && !response.headers.get('Content-Range')?.startsWith(`bytes ${start}-`))
        throw new Error(`${path}: incorrect download range`);
      if (response.status !== 206) { offset = chunk.offset; handle.truncate(offset); }
      const reader = response.body.getReader();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (offset + value.length > end) { handle.truncate(chunk.offset); throw new Error(`${path}: oversized download`); }
        write(value, offset); offset += value.length;
        self.postMessage({ bytes: offset });
      }
      handle.flush();
      if (offset !== end || handle.getSize() !== offset)
        throw Object.assign(new Error(`${path}: incomplete download`), { name: handle.getSize() < offset ? 'QuotaExceededError' : 'Error' });
      if (chunk.sha256) {
        const stored = new Uint8Array(chunk.size);
        handle.read(stored, { at: chunk.offset });
        if (await digest(stored) !== chunk.sha256) { handle.truncate(chunk.offset); throw new Error(`${path}: download integrity check failed`); }
      }
    }
    self.postMessage({ done: true });
  } catch (error) {
    self.postMessage({ error: error.message, name: error.name });
  } finally { handle?.close(); }
};

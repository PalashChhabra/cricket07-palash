const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function roster(mode, hash) {
  const elements = {
    'roster-mode': { value: '' },
    'roster-status': { textContent: '' },
    'go-online': { disabled: true }
  };
  const context = {
    document: { getElementById: id => elements[id] },
    localStorage: { getItem: () => mode, setItem: () => {} },
    fetch: async () => ({ ok: true, json: async () => ({ sha256: hash }) }),
    window: {}
  };
  vm.runInNewContext(fs.readFileSync('site/play/roster.js', 'utf8'), context);
  return { roster: context.window.C07Roster, elements };
}

test('matching IPL packs have a stable version identity', async () => {
  const hash = 'a'.repeat(64);
  assert.equal(await roster('modern-2026', hash).roster.version(), 'modern-2026:' + hash);
});

test('original teams are distinguished from modern IPL', async () => {
  assert.equal(await roster('original', 'a'.repeat(64)).roster.version(), 'original');
});

test('invalid modern pack hash is rejected', async () => {
  await assert.rejects(roster('modern-2026', 'invalid').roster.version(), /SHA-256/);
});

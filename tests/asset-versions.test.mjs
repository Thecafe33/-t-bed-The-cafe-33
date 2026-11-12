import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// A changed stylesheet must change URL: otherwise the first visit after an update mixes new
// markup with a stylesheet still held by the old offline cache.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const own = [...html.matchAll(/<link rel="stylesheet" href="\.\/(assets\/[^"]+)"/g)].map(m => m[1]).filter(h => !h.startsWith('assets/vendor/'));
test('every app stylesheet in index.html is versioned and precached under the same URL', () => {
  assert.ok(own.length > 10);
  for (const href of own) {
    assert.match(href, /\?v=/, `${href} needs a ?v= version`);
    assert.ok(sw.includes(`"${href}"`), `${href} must be listed in sw.js CORE with the same version`);
  }
});

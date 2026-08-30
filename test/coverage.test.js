const test = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

test('coverage runner script is present in package.json', async () => {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(await readFile(packageJsonPath, 'utf8'));

  assert.equal(typeof pkg.scripts['test:coverage'], 'string');
  assert.match(pkg.scripts['test:coverage'], /node --test/);
});

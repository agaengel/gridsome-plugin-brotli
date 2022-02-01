const fs = require('fs')
const path = require('path')
const test = require('tap').test
const os = require('os')

const tested = require('../src/workerGzip')

test('gzip compresses test file', t => {
  const cwd = t.testdir({
    public: {
      'test.js': 'contents'
    }
  })
  const from = path.join(cwd, 'public/test.js')
  const to = path.join(cwd, 'public/test.js')

  const expectedBase64Value = getExpectedBaseByOperatingsystem()

  tested({ from, to })
    .then(res => {
      const compressed = path.join(cwd, 'public/test.js.gz')
      t.ok(fs.existsSync(compressed))
      const fileContents = fs.readFileSync(path.join(cwd, 'public/test.js.gz')).toString('base64')
      t.equal(fileContents, expectedBase64Value, 'The gzip compressed content should be' + expectedBase64Value + 'but it was ' + fileContents)
    })
    .catch(err => t.fail(err))
    .finally(() => t.end())
})

function getExpectedBaseByOperatingsystem () {
  switch (os.type()) {
    case 'Darwin':
      return 'H4sIAAAAAAAAE0vOzytJzSspBgB3Efq0CAAAAA=='
    case 'Windows_NT':
      return 'H4sIAAAAAAAACkvOzytJzSspBgB3Efq0CAAAAA=='
    case 'Linux':
      return 'H4sIAAAAAAAAA0vOzytJzSspBgB3Efq0CAAAAA=='
  }
}

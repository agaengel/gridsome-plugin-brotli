const fs = require('fs')
const path = require('path')
const test = require('tap').test

const tested = require('../src/workerGzip')

test('gzip compresses test file', t => {
  const cwd = t.testdir({
    public: {
      'test.js': 'contents'
    }
  })
  const from = path.join(cwd, 'public/test.js')
  const to = path.join(cwd, 'public/test.js')
  const expectedBase64Value = 'H4sIAAAAAAAAA0vOzytJzSspBgB3Efq0CAAAAA=='

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

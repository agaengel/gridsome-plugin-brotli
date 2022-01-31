'use strict'

const glob = require('glob')
const path = require('path')
const util = require('util')
const zlib = require('zlib')

const Piscina = require('piscina')

const globAsync = util.promisify(glob)

function BrotliPlugin (api, options) {
  api.afterBuild(async ({ config }) => {
    const outputDir = config.outputDir || config.outDir
    await new Promise(resolve => setTimeout(resolve, options.wait));

    // get the files
    const patternExt = (options.extensions.length > 1) ? `{${options.extensions.join(',')}}` : options.extensions[0]
    console.log(`Starting Brotli for the following extensions: ` + patternExt.slice(1, -1))
    const pattern = `**/*.${patternExt}`
    const globResult = await globAsync(pattern, {cwd: outputDir, ignore: '**/*.br', nodir: true})
    const files = globResult.map(res => {
      return {
        from: path.join(outputDir, res),
        to: path.join(outputDir, options.path, `${res}.br`),
        level: options.level
      }
    })

    // compress using worker pool
    const pool = new Piscina({filename: path.resolve(__dirname, 'worker.js')})
    const compress = files.map(file => pool.runTask(file))
    await Promise.all(compress)

    console.log(`Brotli compressed ${pool.completed} files - ${(pool.duration / 1000).toFixed(3)}s - ${(pool.runTime.average / 1000).toFixed(3)}/s`)
  })
}

module.exports = BrotliPlugin

module.exports.defaultOptions = () => ({
  extensions: ['css', 'js'],
  path: '',
  level: zlib.constants.BROTLI_MAX_QUALITY,
  wait: 100
})

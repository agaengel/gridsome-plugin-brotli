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
    console.log(`Starting Compressing the following extensions: ` + patternExt.slice(1, -1))
    const pattern = `**/*.${patternExt}`
    const globResult = await globAsync(pattern, {cwd: outputDir, ignore: '**/*.br', nodir: true})
    const files = globResult.map(res => {
      return {
        from: path.join(outputDir, res),
        to: path.join(outputDir, options.path, `${res}`),
        level: options.level
      }
    })

    // compress brotli using worker pool
    const poolBrotli = new Piscina({filename: path.resolve(__dirname, 'workerBrotli.js')})
    const compressBrotli = files.map(file => poolBrotli.runTask(file))
    await Promise.all(compressBrotli)

    console.log(`Brotli compressed ${poolBrotli.completed} files - ${(poolBrotli.duration / 1000).toFixed(3)}s - ${(poolBrotli.runTime.average / 1000).toFixed(3)}/s`)

    const poolGzip = new Piscina({filename: path.resolve(__dirname, 'workerGzip.js')})
    const compressGzip = files.map(file => poolGzip.runTask(file))
    await Promise.all(compressGzip)

    console.log(`Gzip compressed ${poolGzip.completed} files - ${(poolGzip.duration / 1000).toFixed(3)}s - ${(poolGzip.runTime.average / 1000).toFixed(3)}/s`)
  })
}

module.exports = BrotliPlugin

module.exports.defaultOptions = () => ({
  extensions: ['css', 'js'],
  path: '',
  level: zlib.constants.BROTLI_MAX_QUALITY,
  wait: 100
})

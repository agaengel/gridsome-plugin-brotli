'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const {pipeline} = require('stream')
const util = require('util')
const zlib = require('zlib')

const pipelineAsync = util.promisify(pipeline)

async function gzipCompressFile(from, to, level) {
    const toDir = path.dirname(to)
    await mkdirp(toDir)
    await pipelineAsync(
        fs.createReadStream(from),
        zlib.createGzip(),
        fs.createWriteStream(to + ".gz")
    )
}

module.exports = async function ({from, to, level}) {
    return gzipCompressFile(from, to, level)
}
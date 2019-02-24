'use strict'

const crypto = require('crypto')

/**
 * Returns the checksum of a stream (file).
 *
 * @param {Stream} stream - Readable stream to hash
 * @param {string} [algorithm="sha1"] - Hashing algorithm to use; defaults to "sha1"
 * @returns {Promise<string>} Promise that resolves with the hash of the stream
 * @async
 */
function ChecksumStream(stream, algorithm) {
    // Defaults to SHA1 hashes
    if (!algorithm) {
        algorithm = 'sha1'
    }

    // Calculate the hash
    const hash = crypto.createHash(algorithm)
    return new Promise((resolve, reject) => {
        stream.on('data', (data) => hash.update(data))
            .on('end', () => resolve(hash.digest('hex')))
            .on('error', reject)
    })
}

module.exports = {
    ChecksumStream
}

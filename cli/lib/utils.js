'use strict'

const fs = require('fs')
const util = require('util')
const crypto = require('crypto')

/**
 * Configuration dictionary for Hereditas
 *
 * @typedef {object} HereditasConfig
 * @property {number} version - Version of the configuration object
 * @property {string} contentDir - Folder containing the source content
 * @property {string} distDir - Folder where to place the compiled project
 * @property {boolean} processMarkdown - If true, enable processing of Markdown files into HTML
 * @property {"pbkdf2"|"argon2"} kdf - Key derivation function to use: pbkdf2 (default) or argon2
 * @property {object} auth0 - Auth0 configuration
 * @property {string} auth0.domain - Auth0 domain/tenant (e.g. "myhereditas.auth0.com")
 * @property {string} auth0.clientId - Auth0 app client ID
 */

/**
 * Reads and parses a config file, validating it.
 *
 * @param {string} [filename="hereditas.json"] - Name of the config file to read; default is "hereditas.json"
 * @returns {HereditasConfig} Configuration object
 * @async
 * @throws Throws an error if the config file doesn't exist or is not a valid Hereditas config
 */
async function ReadConfig(filename) {
    if (!filename) {
        filename = 'hereditas.json'
    }

    // Read the file
    const configFile = await util.promisify(fs.readFile)(filename, 'utf8')
    if (!configFile) {
        throw Error('Cannot read config file')
    }

    // Parse JSON and ensure it's a valid format
    const config = JSON.parse(configFile)
    if (!config ||
        typeof config != 'object' ||
        !Object.keys(config).length ||
        !config.version || !config.distDir || !config.contentDir ||
        !config.auth0 || !config.auth0.domain || !config.auth0.clientId) {
        throw Error('Invalid config file')
    }

    // Default key derivation function is pbkdf2
    if (!config.kdf) {
        config.kdf = 'pbkdf2'
    }

    return config
}

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
    ReadConfig,
    ChecksumStream
}

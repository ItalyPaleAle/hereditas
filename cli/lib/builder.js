'use strict'

const fs = require('fs')
const crypto = require('crypto')
const {Readable} = require('stream')
const util = require('util')
const Content = require('./content')
const path = require('path')

// Webpack
const webpack = util.promisify(require('webpack'))
const webpackConfig = require('../../app/webpack.config')

// Promisified fs.readFile, fs.readdir, fs.stat and fs.unlink
const readdirPromise = util.promisify(fs.readdir)
const statPromise = util.promisify(fs.stat)
const unlinkPromise = util.promisify(fs.unlink)

// Promisified crypto.pbkdf2 and crypto.randomBytes
const pbkdf2Promise = util.promisify(crypto.pbkdf2)
const randomBytesPromise = util.promisify(crypto.randomBytes)

// Iterations for PBKDF2
const pbkdf2Iterations = 100000

/**
 * Object containing properties for a file in the content directory
 *
 * @typedef {Object} HereditasContentFile
 * @property {string} path - Path of the file (relative to the contentDir)
 * @property {number} size - File size in bytes
 * @property {string} dist - Random filename used in the dist folder
 * @property {string} tag - Authentication tag for AES-GCM
 * @property {string} processed - If the file has been pre-processed, this explains how (e.g. "markdown"); it's undefined otherwise
 * @property {"text"|"image"|"attach"} display - Configures how the file should be displayed
 */

/**
 * Builds a project
 */
class Builder {
    /**
     * Initializes the object
     * @param {HereditasConfig} config - Config object
     */
    constructor(config) {
        // Store config in the object
        this._config = config

        this._passphrase = 'hello'
        this._appToken = 'hello world'

        // Output
        this.keySalt = null
        this.indexTag = null
        this.hasErrors = false
    }

    /**
     * Performs a full build
     *
     * @async
     */
    async build() {
        // Step 1: clean dist directory
        await this._cleanDirectory(this._config.distDir)

        // Step 2: get the list of files
        let content = await this._scanContent()

        // Step 3: generate a salt for deriving the encryption key
        // This needs to be of 64 bytes, which is the length of a SHA-512 hash
        this.keySalt = await randomBytesPromise(64)

        // Step 4: derive the key
        const key = await this._deriveKey(this._passphrase + this._appToken, this.keySalt)

        // Step 5: encrypt all files
        content = await this._encryptContent(key, content)

        // Step 6: write an (encrypted) index file
        this.indexTag = await this._createIndex(key, content)

        // Step 7: build the app with webpack
        const appParams = {
            distDir: this._config.distDir,
            authIssuer: 'https://' + this._config.auth0.domain,
            authClientId: this._config.auth0.clientId,
            idTokenNamespace: 'https://hereditas.app',
            indexTag: this.indexTag,
            keySalt: this.keySalt,
            kdf: this._config.kdf,
            pbkdf2Iterations
        }
        const webpackStats = await webpack(webpackConfig(appParams))

        // Check if webpack compilation had errors
        if (webpackStats.hasErrors()) {
            const errors = webpackStats.toJson().errors
            console.error('\x1b[31m\x1b[1m' + 'WEBPACK ERRORS' + '\x1b[0m\n')
            for (const i in errors) {
                console.error('\x1b[31m' + errors[i] + '\x1b[0m\n')
            }

            this.hasErrors = true
        }
        if (webpackStats.hasWarnings()) {
            const warnings = webpackStats.toJson().warnings
            console.warn('\x1b[33m\x1b[1m' + 'WEBPACK WARNINGS' + '\x1b[0m\n')
            for (const i in warnings) {
                console.warn('\x1b[33m' + warnings[i] + '\x1b[0m\n')
            }
        }
    }

    /**
     * Deletes all files in a directory, without removing the directory itself.
     *
     * @param {string} directory - Directory to clean
     * @async
     */
    async _cleanDirectory(directory) {
        const files = await readdirPromise(directory)
        return Promise.all(files.map((file) => unlinkPromise(path.join(directory, file))))
    }

    /**
     * Derives a 256 bit key from the passphrase and the salt, using the preferred key derivation function.
     * The key can be used directly for symmetric encryption.
     *
     * @param {string} passphrase - Passphrase for the key
     * @param {string} salt - Salt for the key
     * @returns {Buffer} Promise that resolves to the buffer with the key
     * @async
     */
    _deriveKey(passphrase, salt) {
        if (this._config.kdf == 'pbkdf2') {
            // Using SHA-512, the result is a 512 bit key, so truncate it to 256 bit (32 bytes)
            return pbkdf2Promise(passphrase, salt, pbkdf2Iterations, 32, 'sha512')
        }
        else if (this._config.kdf == 'argon2') {
            throw Error('Key derivation with argon2 has not been implemented yet')
        }
        else {
            throw Error('Invalid key derivation function requested')
        }
    }

    /**
     * Creates an index file and encrypts it on disk.
     *
     * @param {Buffer} key - Encryption key
     * @param {HereditasContentFile[]} content - List of content
     * @returns {Buffer} Authentication tag
     * @async
     */
    async _createIndex(key, content) {
        // Creat the index file, and convert it to a Readable Stream
        const indexData = JSON.stringify(content)
        const inStream = new Readable()
        inStream._read = () => {} // _read is required, but it's a no-op
        inStream.push(indexData, 'utf8')
        inStream.push(null) // End

        // Output stream
        const outStream = fs.createWriteStream(path.join(this._config.distDir, '_index'))

        // Encrypt the index and write it, returning the tag
        return this._encryptStream(key, inStream, outStream)
    }

    /**
     * Encrypts all the content
     * @param {Buffer} key - Encryption key
     * @param {HereditasContentFile[]} content - List of content
     * @returns {HereditasContentFile[]} - List of content with the dist and tag properties set
     * @async
     */
    async _encryptContent(key, content) {
        // Clone the content object
        const result = JSON.parse(JSON.stringify(content))

        // Iterate through the content and encrypt each file
        for (const i in result) {
            // Generate the file name for the output file (a random hex string)
            const dist = (await randomBytesPromise(12)).toString('hex')

            // Create the Readable stream to the input, and Writable stream to the output
            const outStream = fs.createWriteStream(path.join(this._config.distDir, dist))

            // Pre-process the file
            const content = new Content(result[i], this._config)
            await content.process()
            result[i] = content.el

            // Encrypt the stream and get the tag
            const tagBuf = await this._encryptStream(key, content.inStream, outStream)
            const tag = tagBuf.toString('base64')

            // Add the dist and tag properties to the result object
            result[i].dist = dist
            result[i].tag = tag
        }

        return result
    }

    /**
     * Encrypts a stream using aes-256-gcm
     *
     * @param {Buffer} key - Encryption key; must be 256 bit long
     * @param {Stream} inStream - Readable stream with the data to encrypt
     * @param {Stream} outStream - Writable stream to pipe the data to
     * @returns {Buffer} Authentication tag
     * @async
     */
    async _encryptStream(key, inStream, outStream) {
        // Generate an IV
        const iv = await randomBytesPromise(12)

        return new Promise((resolve, reject) => {
            // Write the IV to the outStream, at the beginning
            outStream.write(iv)

            // Create the Cipher, which can be used as a stream transform too
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

            // When the encryption is done, get the authentication tag
            cipher.on('end', () => {
                resolve(cipher.getAuthTag())
            })

            // In case of errors, throw
            inStream.on('error', reject)
            outStream.on('error', reject)

            // Pipe the input stream through the cipher and then to the output stream
            inStream.pipe(cipher).pipe(outStream)
        })
    }

    /**
     * Recursively scans the content directory, listing files
     * @returns {HereditasContentFile[]} List of files
     * @async
     */
    async _scanContent() {
        // Will contain the final list
        const result = []

        // Recursive function that scans folders
        const scanFolder = async (folder) => {
            folder = folder || ''

            // Scan the list of files and folders, recursively
            const list = await readdirPromise(path.join(this._config.contentDir, folder))
            for (const e in list) {
                const el = folder + list[e]

                // Check if it's a directory
                const stat = await statPromise(path.join(this._config.contentDir, el))
                if (!stat) {
                    continue
                }

                // If it's a directory, scan it recursively
                if (stat.isDirectory()) {
                    await scanFolder(el + path.sep)
                }
                else {
                    // Add the file to the list
                    result.push({
                        path: el,
                        size: stat.size
                    })
                }
            }
        }

        // Get the list
        await scanFolder()
        return result
    }
}

module.exports = Builder

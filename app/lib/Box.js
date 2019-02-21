import {DeriveKey, Decrypt} from './CryptoUtils'
import {DecodeArrayBuffer} from './Base64Utils'
import {WaitPromise} from './Utils'

export class Box {
    constructor() {
        this._encryptedData = null
        this._contents = null
        this._indexFetchingPromise = null
    }

    /**
     * Returns true if passphrase has been entered and the index decrypted
     *
     * @returns {boolean}
     */
    hasIndex() {
        return !!this._contents
    }

    /**
     * Reset decrypted index, will need to get a passphrase
     */
    resetIndex() {
        this._contents = null
    }

    /**
     * Returns decrypted index
     * @returns {Object}
     */
    getIndex() {
        return this._contents
    }

    /**
     * Fetches the index from the web server
     *
     * @returns {Promise<void>} Promise that resolves (with no value) when the index has been fetched
     * @async
     */
    fetchIndex() {
        // If we have the index already, do nothing
        if (this._encryptedData) {
            return Promise.resolve()
        }

        // If we're already fetching the index, return the promise
        if (this._indexFetchingPromise) {
            return this._indexFetchingPromise
        }

        // Fetch the index
        this._indexFetchingPromise = fetch('_index')
            // Grab the contents as ArrayBuffer
            .then((response) => response.arrayBuffer())
            // Store the results in the object
            .then((buffer) => {
                // Read the data from the response
                this._encryptedData = {
                    // The first 12 bytes are the IV
                    iv: buffer.slice(0, 12),
                    data: buffer.slice(12)
                }

                // Request is done
                this._indexFetchingPromise = null
            })
            .then(() => WaitPromise(1000))

        // Return the promise
        return this._indexFetchingPromise
    }

    /**
     * Attempts to decrypt the data using the passphrase and the app token
     *
     * @param {string} passphrase - Passphrase typed by the user
     * @param {string} appToken - Encryption token for the app
     * @async
     */
    unlock(passphrase, appToken) {
        if (!passphrase || !appToken) {
            throw Error('Empty passphrase or app token')
        }

        // If we haven't fetched the index yet, return
        if (!this._encryptedData) {
            return Promise.resolve(false)
        }

        // Try decrypting the index: this will verify the passphrase too
        return Promise.resolve()
            // First: derive the encryption key
            .then(() => DeriveKey(passphrase + appToken, DecodeArrayBuffer(process.env.KEY_SALT)))
            // Decrypt the index
            .then(([key]) => Decrypt(key, this._encryptedData.iv, this._encryptedData.data, DecodeArrayBuffer(process.env.INDEX_TAG)))
            .then((contents) => console.log(contents))
    }
}

import {DeriveKey, Decrypt} from './CryptoUtils'
import {DecodeArrayBuffer} from './Base64Utils'

/**
 * Manages the Hereditas box
 */
export class Box {
    constructor() {
        this._key = null
        this._contents = null
        this._indexFetchingPromise = null
        this._encryptedIndex = null
    }

    /**
     * Returns true if the box is unlocked
     *
     * @returns {boolean}
     */
    isUnlocked() {
        return this._key && this._contents
    }

    /**
     * Lock the box again, removing the key and the decrypted index from memory
     */
    lock() {
        this._key = null
        this._contents = null
    }

    /**
     * Returns decrypted index
     * @returns {Array}
     */
    getContents() {
        return this.isUnlocked() ?
            this._contents :
            []
    }

    /**
     * Fetches the index from the web server
     *
     * @returns {Promise<void>} Promise that resolves (with no value) when the index has been fetched
     * @async
     */
    fetchIndex() {
        // If we have the index already, do nothing
        if (this._encryptedIndex) {
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
                this._encryptedIndex = {
                    // The first 12 bytes are the IV
                    iv: buffer.slice(0, 12),
                    data: buffer.slice(12)
                }

                // Request is done
                this._indexFetchingPromise = null
            })

        // Return the promise
        return this._indexFetchingPromise
    }

    /**
     * Attempts to decrypt the data using the passphrase and the app token
     *
     * @param {string} passphrase - Passphrase typed by the user
     * @param {string} appToken - Encryption token for the app
     * @async
     * @throws Throws an exception if the decryption fails, which usually means that the key/passphrase is wrong
     */
    unlock(passphrase, appToken) {
        if (!passphrase || !appToken) {
            return Promise.reject('Empty passphrase or app token')
        }

        // If we haven't fetched the index yet, return
        if (!this._encryptedIndex) {
            return Promise.resolve(false)
        }

        // Convert from Base64 to ArrayBuffer
        const keySalt = DecodeArrayBuffer(process.env.KEY_SALT)
        const indexTag = DecodeArrayBuffer(process.env.INDEX_TAG)

        // Try decrypting the index: this will verify the passphrase too
        return Promise.resolve()
            // First: derive the encryption key
            .then(() => DeriveKey(passphrase + appToken, keySalt))
            .then(([key]) => {
                this._key = key
            })

            // Decrypt the index
            .then(() => Decrypt(this._key, this._encryptedIndex.iv, this._encryptedIndex.data, indexTag))
            .then((str) => {
                // Store the contents
                this._contents = JSON.parse(str)
            })

            // Exceptions likely mean that the key/passphrase are wrong
            .catch((err) => {
                // Log the error
                console.error('Error while unlocking the box:', err)

                // Ensure the box remains locked
                this.lock()

                // Bubble up
                throw Error('Failed to unlock to box')
            })
    }
}

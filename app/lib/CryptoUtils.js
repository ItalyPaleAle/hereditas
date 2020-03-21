// Inspired by https://gist.github.com/tscholl2/dc7dc15dc132ea70a98e8542fefffa28#file-aes-js

/**
 * Encodes a utf8 string as a byte array.
 * @param {String} str
 * @returns {Uint8Array}
 */
export function str2buf(str) {
    return new TextEncoder('utf-8').encode(str)
}

/**
 * Decodes a byte array as a utf8 string.
 * @param {Uint8Array} buffer
 * @returns {String}
 */
export function buf2str(buffer) {
    return new TextDecoder('utf-8').decode(buffer)
}

/**
 * Conctatenates two ArrayBuffer's
 *
 * @param {ArrayBuffer} buffer1 - First buffer
 * @param {ArrayBuffer} buffer2 - Second buffer
 * @returns {ArrayBuffer} The buffer with the data concatenated
 */
function concatBuffers(buffer1, buffer2) {
    const result = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
    result.set(new Uint8Array(buffer1), 0)
    result.set(new Uint8Array(buffer2), buffer1.byteLength)
    return result.buffer
}

/**
 * Given a passphrase, this generates a crypto key
 * using `PBKDF2` with SHA-512 and N iterations.
 * If no salt is given, a new one is generated.
 * The return value is an array of `[key, salt]`.
 * @param {string} passphrase
 * @param {UInt8Array} [salt] Random bytes; will be generated if not set
 * @returns {Promise<[CryptoKey,UInt8Array]>}
 * @async
 */
export function DeriveKey(passphrase, salt) {
    salt = salt || window.crypto.getRandomValues(new Uint8Array(64))
    return window.crypto.subtle.importKey('raw', str2buf(passphrase), 'PBKDF2', false, ['deriveKey'])
        .then((key) =>
            window.crypto.subtle.deriveKey(
                {name: 'PBKDF2', salt, iterations: process.env.PBKDF2_ITERATIONS, hash: 'SHA-512'},
                key,
                {name: 'AES-KW', length: 256},
                false,
                ['unwrapKey'],
            )
        )
        .then((key) => [key, salt])
}

/**
 * Given a key and ciphertext (in the form of a string) as given by `encrypt`,
 * this decrypts the ciphertext and returns the original plaintext
 * @param {CryptoKey} key - Encryption key
 * @param {ArrayBuffer} iv - IV
 * @param {ArrayBuffer} data - Data to decrypt
 * @param {ArrayBuffer} tag - AES-GCM tag
 * @returns {Promise<string>} Decrypted text as string
 * @async
 * @throws Throws an error if the decryption fails, likely meaning that the key was wrong.
 */
export function Decrypt(key, iv, data, tag) {
    const ciphertext = concatBuffers(data, tag)
    return window.crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, ciphertext)
}

/**
 * Unwraps a key wrapped with AES-KW (per RFC 3349)
 *
 * @param {CryptoKey} wrappingKey - Key used to wrap/unwrap the key
 * @param {ArrayBuffer} ciphertext - Wrapped key
 * @returns {Promise<CryptoKey>} Unwrapped key
 * @async
 * @throws Throws an error if the decryption fails, likely meaning that the key was wrong.
 */
export function UnwrapKey(wrappingKey, ciphertext) {
    return window.crypto.subtle.unwrapKey(
        'raw',
        ciphertext,
        wrappingKey,
        {name: 'AES-KW'},
        {name: 'AES-GCM'},
        false,
        ['decrypt']
    )
    .then((key) => {
        console.log(key)
        return key
    })
}

'use strict'

const crypto = require('crypto')
const util = require('util')

/**
 * Generates a token with `length` random bytes, and returns it as a base64-encoded string.
 *
 * @param {number} length - Number of bytes to generate (before converting to base64)
 * @returns {string} Token represented as base64-encoded string
 */
async function GenerateToken(length) {
    if (!length || length < 0) {
        length = 20
    }

    const bytes = await util.promisify(crypto.randomBytes)(length)
    return bytes.toString('base64')
}

module.exports = {
    GenerateToken
}

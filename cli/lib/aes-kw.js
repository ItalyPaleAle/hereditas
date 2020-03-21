/**
 * This module is based on https://github.com/calvinmetcalf/aes-kw
 *
 * Copyright (C) Calvin Metcalf. Released under MIT license.
 */

const crypto = require('crypto')
const xor = require('buffer-xor/inplace')
const bufferEq = require('buffer-equal-constant-time')

const IV = Buffer.from('A6A6A6A6A6A6A6A6', 'hex')
const EMPTY_BUF = Buffer.alloc(0)
function Encrypter(key, decipher) {
    if (decipher) {
        this.cipher = crypto.createDecipheriv(getCipherName(key), key, EMPTY_BUF)
    }
    else {
        this.cipher = crypto.createCipheriv(getCipherName(key), key, EMPTY_BUF)
    }
    this.cipher.setAutoPadding(false)
}
Encrypter.prototype.encrypt = function(iv, buf) {
    if (iv.length !== 8) {
        throw new Error('invalid iv length')
    }
    if (buf.length !== 8) {
        throw new Error('invalid data length')
    }
    this.cipher.update(iv)
    return this.cipher.update(buf)
}
Encrypter.prototype.done = function() {
    this.cipher.final()
}
function getCipherName(key) {
    switch (key.length) {
        case 16: return 'aes-128-ecb'
        case 24: return 'aes-192-ecb'
        case 32: return 'aes-256-ecb'
    }
}
function msb(b) {
    return b.slice(0, 8)
}
function lsb(b) {
    return b.slice(-8)
}
exports.encrypt = encrypt
function encrypt(key, plaintext) {
    if (plaintext.length % 8) {
        throw new Error('must be 64 bit increment')
    }
    const enc = new Encrypter(key)
    let j = -1
    let i, b
    const t = Buffer.alloc(8)
    let a = IV
    const n = plaintext.length / 8
    const r = createR(plaintext)
    while (++j <= 5) {
        i = -1
        while (++i < n) {
            b = enc.encrypt(a, r[i])
            t.writeUInt32BE(0, 0)
            t.writeUInt32BE((n * j) + i + 1, 4)
            a = xor(msb(b), t)
            r[i] = lsb(b)
        }
    }
    enc.done()
    return Buffer.concat([a].concat(r))
}
exports.decrypt = decrypt
function decrypt(key, ciphertext) {
    if (ciphertext.length % 8) {
        throw new Error('must be 64 bit increment')
    }
    const enc = new Encrypter(key, true)
    let j = 6
    let i, b
    const t = Buffer.alloc(8)
    const n = ciphertext.length / 8
    const r = createR(ciphertext)
    let a = r[0]
    while (--j >= 0) {
        i = n
        while (--i) {
            t.writeUInt32BE(0, 0)
            t.writeUInt32BE(((n - 1)* j) + i, 4)
            a = xor(a, t)
            b = enc.encrypt(a, r[i])
            a = msb(b)
            r[i] = lsb(b)
        }
    }
    enc.done()
    if (!bufferEq(a, IV)) {
        throw new Error('unable to decrypt')
    }
    return Buffer.concat(r.slice(1))
}
function createR(buf) {
    const n = buf.length / 8
    const out = new Array(n)
    let i = -1
    while (++i < n) {
        out[i] = buf.slice(i * 8, (i + 1) * 8)
    }
    return out
}

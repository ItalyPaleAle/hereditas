import {RandomString} from './Utils'
import storage from './StorageService'
const IdTokenVerifier = require('idtoken-verifier')

/**
 * Returns true if a string represents a JWT token. This only checks if the string is in the right format, and doesn't parse the token.
 *
 * @param {string} string - String to test
 * @returns {boolean} True if the string is in the format of a JWT token
 */
export function IsJWT(string) {
    return string && !!string.match(/^([A-Za-z0-9\-_~+/]+[=]{0,2})\.([A-Za-z0-9\-_~+/]+[=]{0,2})(?:\.([A-Za-z0-9\-_~+/]+[=]{0,2}))?$/)
}

class Nonce {
    constructor() {
        this._nonceKeyName = 'hereditas-nonce'
        this._nonceLength = 7
    }

    /**
     * Generates a new nonce and stores it in the session storage
     *
     * @returns {string} A nonce
     */
    generate() {
        // Generate a nonce
        const nonce = RandomString(this._nonceLength)

        // Store the nonce in the session
        storage.sessionStorage.setItem(this._nonceKeyName, nonce)

        return nonce
    }

    /**
     * Retrieves the last nonce from session storage
     *
     * @returns {string} A nonce
     */
    retrieve() {
        const read = storage.sessionStorage.getItem(this._nonceKeyName)

        const regExp = new RegExp('^[A-Za-z0-9_\\-]{' + this._nonceLength + '}$')
        if (!read || !read.match(regExp)) {
            return null
        }

        return read
    }
}

export class AuthenticationAttempts {
    constructor() {
        this._attemptsKeyName = 'hereditas-attempts'
    }

    getAttempts() {
        return parseInt((storage.sessionStorage.getItem(this._attemptsKeyName) || 0), 10)
    }

    increaseAttempts() {
        const attempts = this.getAttempts()
        storage.sessionStorage.setItem(this._attemptsKeyName, attempts + 1)
        return attempts
    }

    resetAttempts() {
        storage.sessionStorage.setItem(this._attemptsKeyName, 0)
    }
}

export class Credentials {
    constructor() {
        this._sessionKeyName = 'hereditas-jwt'
        this._tokenValidated = false
        this._nonce = new Nonce()
        this._profile = null
    }

    /**
     * Returns the authorization URL to point users to, storing the nonce
     *
     * @returns {string} Authorization URL
     */
    authorizationUrl() {
        // Generate a nonce
        const nonce = this._nonce.generate()

        // URL-encode the return URL
        const appUrl = encodeURIComponent(window.location.href)

        // Generate the URL
        const authIssuer = process.env.AUTH_ISSUER
        const authClientId = process.env.AUTH_CLIENT_ID
        return `${authIssuer}/authorize?client_id=${authClientId}&response_type=id_token&redirect_uri=${appUrl}&scope=openid%20profile&nonce=${nonce}&response_mode=fragment`
    }
    /**
     * Returns the profile object from the JWT token
     *
     * @returns {Object} Profile for the authenticated user
     * @async
     */
    async getProfile() {
        // If we have a pre-parsed and pre-validated profile in memory, return that
        if (this._profile) {
            return this._profile
        }

        // Get the token
        const jwt = this.getToken()
        if (!jwt) {
            return {}
        }

        // Get the profile out of the token
        const profile = await this._validateToken(jwt)
        if (!profile) {
            return {}
        }
        this._profile = profile
        return profile
    }

    /**
     * Returns the JWT token for the session
     *
     * @returns {string|null} JWT Token, or null if no token
     */
    getToken() {
        const read = storage.sessionStorage.getItem(this._sessionKeyName)
        if (!read || !read.length) {
            return null
        }

        let data
        try {
            data = JSON.parse(read)
        }
        catch (error) {
            console.error('Error while parsing JSON from sessionStorage', error)
            throw Error('Could not get the token from session storage')
        }

        if (!data || !data.jwt || !IsJWT(data.jwt)) {
            return null
        }

        return data.jwt
    }

    /**
     * Stores the JWT token for the session
     *
     * @param {string} jwt - JWT Token
     * @async
     */
    async setToken(jwt) {
        // Delete the profile in memory
        this._profile = null

        // First, validate the token
        const profile = await this._validateToken(jwt)
        if (!profile) {
            throw Error('Token validation failed')
        }

        // Store the token
        storage.sessionStorage.setItem(this._sessionKeyName, JSON.stringify({jwt}))

        // Set the profile in memory
        this._profile = profile
    }

    /**
     * Validates a token
     *
     * @param {string} jwt - JWT token to validate
     * @returns {Promise<Object>} Extracted payload
     * @private
     */
    async _validateToken(jwt) {
        // Check the format
        if (!jwt || !IsJWT(jwt)) {
            throw Error('Invalid token')
        }

        // Ensure issuer ends with /
        const issuer = process.env.AUTH_ISSUER + (process.env.AUTH_ISSUER.charAt(process.env.AUTH_ISSUER.length - 1) != '/' ? '/' : '')

        // Validate the token
        const verifier = new IdTokenVerifier({
            issuer,
            audience: process.env.AUTH_CLIENT_ID
        })
        const payload = await new Promise((resolve) => {
            verifier.verify(jwt, this._nonce.retrieve(), (error, payload) => {
                if (error) {
                    console.error('Validation error', error)
                    throw Error('Invalid token')
                }

                // Check if the payload contains the Hereditas namespace
                if (!payload[process.env.ID_TOKEN_NAMESPACE]) {
                    console.error('Token doesn\'t contain the Hereditas namespace')
                    throw Error('Token doesn\'t contain the Hereditas namespace')
                }

                resolve(payload)
            })
        })

        return payload
    }
}

const credentials = new Credentials()
export default credentials

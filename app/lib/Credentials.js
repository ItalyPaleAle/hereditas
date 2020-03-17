import {RandomString} from './Utils'
import storage from './StorageService'
import IdTokenVerifier from 'idtoken-verifier'

/**
 * During the authentication process we need to use nonce's to protect against certain kinds of attacks.
 */
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

/**
 * Manages authentication attemps and keeps a counter. This is important to avoid endless loops between the app and the auth provider.
 */
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

/**
 * Managed the authentication flow, and validates the JWT token.
 */
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
        let profile
        try {
            profile = await this._validateToken(jwt)
            if (!profile) {
                profile = {}
            }
            this._profile = profile
            return profile
        }
        catch (e) {
            this._profile = {}
            throw e
        }
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
            // eslint-disable-next-line no-console
            console.error('Error while parsing JSON from sessionStorage', error)
            throw Error('Could not get the token from session storage')
        }

        if (!data || !data.jwt) {
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
        // Ensure issuer ends with /
        const issuer = process.env.AUTH_ISSUER + (process.env.AUTH_ISSUER.charAt(process.env.AUTH_ISSUER.length - 1) != '/' ? '/' : '')

        // Validate the token
        const verifier = new IdTokenVerifier({
            issuer,
            audience: process.env.AUTH_CLIENT_ID
        })
        const payload = await new Promise((resolve, reject) => {
            verifier.verify(jwt, this._nonce.retrieve(), (error, payload) => {
                if (error) {
                    // eslint-disable-next-line no-console
                    console.error('Validation error', error)
                    return reject('Invalid token')
                }

                // Check if the payload contains the Hereditas namespace
                if (!payload[process.env.ID_TOKEN_NAMESPACE]) {
                    // eslint-disable-next-line no-console
                    console.error('Token doesn\'t contain the Hereditas namespace')
                    return reject('Token doesn\'t contain the Hereditas namespace')
                }

                resolve(payload)
            })
        })

        return payload
    }
}

// The default export is an instance (singleton) of Credentials
const credentials = new Credentials()
export default credentials

'use strict'

const fs = require('fs')
const util = require('util')
const path = require('path')

const ManagementClient = require('auth0').ManagementClient

/**
 * Configures Auth0 to work with Hereditas
 */
class Auth0Management {
    /**
     * Initializes the object
     * @param {Config} config - Config object
     */
    constructor(config) {
        // Ensure that the configuration has Auth0 credentials
        const auth0Config = config.get('auth0')
        if (!auth0Config || !auth0Config.domain || !auth0Config.managementClientId || !auth0Config.managementClientSecret) {
            throw Error('Auth0 Management Client credentials are not present')
        }

        this._config = config
        this._management = new ManagementClient({
            domain: auth0Config.domain,
            clientId: auth0Config.managementClientId,
            clientSecret: auth0Config.managementClientSecret
        })
    }

    /**
     * Create the client (application) on Auth0.
     *
     * @returns {string} Client ID of the new application
     */
    async createClient() {
        // Configuration for the client
        const data = {
            name: 'Hereditas',
            is_first_party: true,
            oidc_conformant: true,
            cross_origin_auth: false,
            description: 'This application is managed by the Hereditas CLI',
            logo_uri: '',
            sso: false,
            callbacks: [
                'http://localhost:5000'
            ],
            allowed_logout_urls: [],
            allowed_clients: [],
            client_metadata: {
                requestTime: '0',
                token: 'hello world',
                waitTime: '86400',
                hereditas: '1'
            },
            allowed_origins: [],
            jwt_configuration: {
                alg: 'RS256',
                lifetime_in_seconds: 1800,
                secret_encoded: false
            },
            token_endpoint_auth_method: 'none',
            app_type: 'spa',
            grant_types: [
                'authorization_code'
            ]
        }

        // Create the client
        const result = await this._management.clients.create(data)
        if (result) {
            return result.client_id
        }
    }

    /**
     * Retrieve a client (application) from Auth0.
     *
     * @param {string} clientId - Client ID
     */
    async getClient(clientId) {
        const data = await this._management.clients.get(clientId)
        if (!data || !data[0]) {
            return null
        }
        return data[0]
    }

    /**
     * List all rules
     *
     * @returns {Array} List of rules
     * @async
     */
    listRules() {
        return this._management.rules.getAll()
    }

    /**
     * Create all rules required by Hereditas.
     *
     * @returns {Array<string>} Array with the ID of the rules, in order
     * @async
     */
    async createRules() {
        // Read all scripts
        const readFilePromise = util.promisify(fs.readFile)
        const scripts = await Promise.all([
            readFilePromise(path.resolve(__dirname, '../../auth0/rules/01-whitelist.js'), 'utf8'),
            readFilePromise(path.resolve(__dirname, '../../auth0/rules/02-notify.js'), 'utf8'),
            readFilePromise(path.resolve(__dirname, '../../auth0/rules/03-wait-logic.js'), 'utf8')
        ])
        const names = [
            'Hereditas 01 - Whitelist email addresses',
            'Hereditas 02 - Wait logic',
            'Hereditas 03 - Notify'
        ]

        // Create all rules, in order
        const promises = []
        for (let i = 0; i < 3; i++) {
            promises.push(this._management.rules.create({
                enabled: true,
                stage: 'login_success',
                order: i + 1,
                name: names[i],
                script: scripts[i]
            }))
        }
        const results = await Promise.all(promises)

        // Return the IDs of the rules
        return results.map((el) => el.id)
    }

    listRulesConfigs() {
        return this._management.rulesConfigs.getAll()
    }

    updateRulesConfigs() {
        const rulesConfigs = {
            AUTH0_CLIENT_ID: this._config.get('auth0.managementClientId'),
            AUTH0_CLIENT_SECRET: this._config.get('auth0.managementClientSecret'),
            WEBHOOK_URL: this._config.get('webhookUrl')
        }

        // Create all rules configurations
        const promises = []
        for (const key in rulesConfigs) {
            const value = rulesConfigs[key]
            promises.push(this._management.rulesConfigs.set({key}, {value}))
        }

        return Promise.all(promises)
    }
}

module.exports = Auth0Management

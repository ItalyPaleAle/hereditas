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
     * Ensures that we have a client (application) on Auth0 whose configuration matches the desired one. If a client ID is passed, the method checks if the client exists and updates it; otherwise, it will create a new client.
     *
     * @param {string} [clientId] - Auth0 client (application) ID
     * @returns {string} Client ID of the application (either new or updated)
     */
    async syncClient(clientId) {
        // Check if we already have a client and it exists
        if (clientId) {
            // Check if it exists; if it does, update the data
            let data
            try {
                data = await this.getClient(clientId)
            }
            catch (err) {
                // If the exception is because the client doesn't exist, all good; otherwise, re-throw it
                if (err.toString().match(/Not Found/i)) {
                    data = null
                }
                else if (err.name && err.name == 'access_denied') {
                    throw Error('Invalid Auth0 credentials')
                }
                else {
                    throw err
                }
            }

            // If we have an existing client, update it
            if (data) {
                try {
                    await this.updateClient(clientId)
                }
                catch (err) {
                    if (err.name && err.name == 'access_denied') {
                        throw Error('Invalid Auth0 credentials')
                    }
                    else {
                        throw err
                    }
                }
            }
            else {
                clientId = undefined
            }
        }

        // If client doesn't exist, create it
        if (!clientId) {
            try {
                clientId = await this.createClient()
            }
            catch (err) {
                if (err.name && err.name == 'access_denied') {
                    throw Error('Invalid Auth0 credentials')
                }
                else {
                    throw err
                }
            }
        }

        return clientId
    }

    /**
     * Updates a client (application) on Auth0 so the configuration matches the desired one.
     *
     * @param {string} clientId - Auth0 client (application) ID
     * @returns {string} Client ID of the updated application
     */
    async updateClient(clientId) {
        const params = {
            client_id: clientId
        }
        const result = await this._management.clients.update(params, this._clientConfiguration())
        if (result) {
            return result.client_id
        }
    }

    /**
     * Create the client (application) on Auth0.
     *
     * @returns {string} Client ID of the new application
     */
    async createClient() {
        // Create the client
        const result = await this._management.clients.create(this._clientConfiguration())
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
        const data = await this._management.clients.get({client_id: clientId})
        if (!data || data.client_id != clientId) {
            return null
        }
        return data
    }

    /**
     * Ensures that the rules Hereditas needs are present in Auth0, and re-creates them so they're on the last version of the configuration and code.
     *
     * @param {Array<string>} [ruleIds] - List of rules already created by Hereditas (if any)
     * @returns {Array<string>} New list of rules managed by Hereditas
     */
    async syncRules(ruleIds) {
        // First, check if the rules still exist
        if (ruleIds && ruleIds.length) {
            const rules = await this.listRules()
            if (rules && Array.isArray(rules) && rules.length) {
                // Delete all rules from the array that still exist
                const promises = []
                for (let i = 0; i < rules.length; i++) {
                    const el = rules[i]
                    if (!el || !el.id) {
                        continue
                    }

                    if (ruleIds.indexOf(el.id) != -1) {
                        promises.push(this._management.rules.delete({id: el.id}))
                    }
                }

                // Await all requests in parallel
                await Promise.all(promises)
            }
        }

        // Lastly, re-create all rules and return the new IDs
        return this.createRules()
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
            readFilePromise(path.resolve(__dirname, '../../auth0/01-whitelist.js'), 'utf8'),
            readFilePromise(path.resolve(__dirname, '../../auth0/02-notify.js'), 'utf8'),
            readFilePromise(path.resolve(__dirname, '../../auth0/03-wait-logic.js'), 'utf8')
        ])
        const names = [
            'Hereditas 01 - Whitelist email addresses',
            'Hereditas 02 - Notify',
            'Hereditas 03 - Wait logic'
        ]

        // Replacer function in scripts
        const users = this._config.get('users') || []
        const replacer = (script) => {
            const vars = {
                '/*%ALL_USERS%*/': JSON.stringify(users.map((el) => el.email)),
                '/*%OWNERS%*/': JSON.stringify(users.filter((el) => el.role == 'owner').map((el) => el.email))
            }
            return script.replace(/\/\*%([A-Za-z0-9_]+)%\*\//, (token) => {
                return vars[token]
            })
        }

        // Create all rules, in order
        const promises = []
        for (let i = 0; i < 3; i++) {
            promises.push(this._management.rules.create({
                enabled: true,
                stage: 'login_success',
                order: i + 1,
                name: names[i],
                script: replacer(scripts[i])
            }))
        }
        const results = await Promise.all(promises)

        // Return the IDs of the rules
        return results.map((el) => el.id)
    }

    /**
     * List all rules configurations (only the keys, not values)
     *
     * @returns {Array} Array with all the rules configurations
     * @async
     */
    listRulesConfigs() {
        return this._management.rulesConfigs.getAll()
    }

    /**
     * Updates all rules configurations. This creates new configurations, and overwrites existing ones.
     *
     * @async
     */
    async updateRulesConfigs() {
        const rulesConfigs = {
            APP_TOKEN: this._config.get('appToken'),
            AUTH0_CLIENT_ID: this._config.get('auth0.managementClientId'),
            AUTH0_CLIENT_SECRET: this._config.get('auth0.managementClientSecret'),
            WEBHOOK_URL: this._config.get('webhookUrl') || '0'
        }

        // Create all rules configurations
        const promises = []
        for (const key in rulesConfigs) {
            const value = rulesConfigs[key]
            promises.push(this._management.rulesConfigs.set({key}, {value}))
        }

        await Promise.all(promises)
    }

    /**
     * Returns the configuration object for a client (application) on Auth0.
     *
     * @returns {Object} Configuration object for the client (application) on Auth0
     */
    _clientConfiguration() {
        return {
            name: 'Hereditas',
            is_first_party: true,
            oidc_conformant: true,
            cross_origin_auth: false,
            description: 'This application is managed by the Hereditas CLI. For information, see https://hereditas.app',
            logo_uri: '',
            sso: false,
            callbacks: this._config.get('urls'),
            allowed_logout_urls: [],
            allowed_clients: [],
            client_metadata: {
                requestTime: '0',
                waitTime: this._config.get('waitTime') + '', // Cast as string
                hereditas: '1'
            },
            allowed_origins: [],
            jwt_configuration: {
                alg: 'RS256',
                lifetime_in_seconds: 1800
            },
            token_endpoint_auth_method: 'none',
            app_type: 'spa',
            grant_types: [
                'implicit'
            ]
        }
    }
}

module.exports = Auth0Management

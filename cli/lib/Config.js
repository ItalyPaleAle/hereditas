'use strict'

const fs = require('fs')
const util = require('util')
const defaultsDeep = require('lodash.defaultsdeep')
const cloneDeep = require('lodash.clonedeep')
const SMHelper = require('smhelper')

const ConfigVersion = 20190222

/**
 * Authorized users
 *
 * @typedef {object} HereditasUser
 * @property {string} email - Email address
 * @property {"user"|"owner"} role - Role: "user" or "owner"
 */

/**
 * Configuration dictionary for Hereditas
 *
 * @typedef {object} HereditasConfig
 * @property {number} version - Version of the configuration object
 * @property {string} contentDir - Folder containing the source content
 * @property {string} distDir - Folder where to place the compiled project
 * @property {boolean} processMarkdown - If true, enable processing of Markdown files into HTML
 * @property {object} auth0 - Auth0 configuration
 * @property {string} auth0.domain - Auth0 domain/tenant (e.g. "myhereditas.auth0.com")
 * @property {string} auth0.hereditasClientId - Auth0 app client ID for Hereditas
 * @property {string} auth0.managementClientId - Client ID for the Auth0 Management app
 * @property {string} auth0.managementClientSecret - Client Secret for the Auth0 Management app
 * @property {Array<string>} rules - ID of the Auth0 rules created by the Hereditas CLI
 * @property {"pbkdf2"|"argon2"} kdf - Key derivation function to use: pbkdf2 or argon2 (default)
 * @property {object} pbkdf2 - Configuration for pbkdf2
 * @property {string} pbkdf2.iterations - Number of iterations
 * @property {string} webhookUrl - URL of the webhook to trigger when a new user logs into Hereditas.
 * @property {Array<HereditasUser>} users - List of users
 * @property {string} appToken - Application token; when combined with the user passphrase, this allows deriving the encryption key
 * @property {number} waitTime - The amount of time, in seconds, to wait before Auth0 can return to users the app token
 * @property {Array<string>} urls - list of URLs where your app will be deployed to, e.g. `https://hereditas.example.com`, or `https://myname.blob.core.windows.net/hereditas`, etc; this is used for OAuth redirects.
 */

/**
 * Helper class for managing Hereditas configuration
 */
class Config {
    /**
     * Initializes the object.
     *
     * @param {string} [filename="hereditas.json"] - Name of the file on disk
     */
    constructor(filename) {
        if (!filename) {
            filename = 'hereditas.json'
        }

        this._filename = filename

        // userConfig is the data read from the config file. config is that, plus defaults
        this._userConfig = null
        this._config = {}
    }

    /**
     * Create a new userConfig object.
     *
     * Note that this doesn't save changes on disk, you must manually call `save()`.
     *
     * @param {HereditasConfig} initConfig - Initial configuration values
     */
    create(initConfig) {
        this._userConfig = {
            version: ConfigVersion
        }
        defaultsDeep(this._userConfig, initConfig)

        // Update the config in memory
        this._config = {}
        this._defaults()
    }

    /**
     * Reads and parses a config file, validating it.
     *
     * @param {string} [filename="hereditas.json"] - Name of the config file to read; default is "hereditas.json"
     * @throws Throws an error if the config file doesn't exist or is not a valid Hereditas config
     */
    async load() {
        // Read the file
        const configFile = await util.promisify(fs.readFile)(this._filename, 'utf8')
        if (!configFile) {
            throw Error('Cannot read config file')
        }

        // Parse JSON and ensure it's a valid format
        this._userConfig = JSON.parse(configFile)
        if (!this._validate()) {
            throw Error('Invalid config file')
        }

        // Apply defaults
        this._defaults()
    }

    /**
     * Returns value for key from configuration
     *
     * @param {string} key - Key of the object, in "dot notation"
     * @returns {*} Value of the configuration key requested (cloned)
     */
    get(key) {
        let val

        // If key contains a dot, we are requesting a nested object
        if (key.indexOf('.') != -1) {
            val = SMHelper.getDescendantProperty(this._config, key)
        }
        else {
            val = this._config[key]
        }

        // Returns a clone of the object so it can't be modified
        return cloneDeep(val)
    }

    /**
     * Returns all config values (cloned).
     *
     * @returns {HereditasConfig} All configuration data
     */
    all() {
        return cloneDeep(this._config)
    }

    /**
     * Updates the value of a user config.
     *
     * Note: this does NOT save the changes on disk; you must invoke `save()` for that.
     *
     * @param {string} key - Name of the key to update, using the "dot notation"
     * @param {*} value - New value
     */
    set(key, value) {
        // Update the value and validate the config
        SMHelper.updatePropertyInObject(this._userConfig, key, value)
        if (!this._validate()) {
            throw Error('Invalid config data')
        }

        // Update the config in memory
        this._config = {}
        this._defaults()
    }

    /**
     * Save changes to user configuration to disk.
     *
     * @returns {Promise} Returns a promise that resolves when the changes have been committed to disk.
     * @async
     */
    save() {
        return util.promisify(fs.writeFile)(this._filename, JSON.stringify(this._userConfig, null, 2))
    }

    /**
     * Validates a config object, ensuring that all required keys are present.
     *
     * @returns {boolean} Returns true on valid configuration objects
     * @throws Throws an Error if the config file isn't valid
     */
    _validate() {
        if (!this._userConfig || typeof this._userConfig != 'object' || !Object.keys(this._userConfig).length) {
            throw Error('Invalid config file')
        }
        if (!this._userConfig.version) {
            throw Error('Config file is missing required key version')
        }
        if (!this._userConfig.distDir) {
            throw Error('Config file is missing required key distDir')
        }
        if (!this._userConfig.contentDir) {
            throw Error('Config file is missing required key contentDir')
        }
        if (!this._userConfig.appToken) {
            throw Error('Config file is missing required key appToken')
        }
        if (!this._userConfig.auth0 || typeof this._userConfig.auth0 != 'object' || !Object.keys(this._userConfig.auth0).length) {
            throw Error('Config file is missing required key auth0')
        }
        if (!this._userConfig.auth0.domain) {
            throw Error('Config file is missing required key auth0.domain')
        }
        if (!this._userConfig.urls || !Array.isArray(this._userConfig.urls) || !this._userConfig.urls.length) {
            throw Error('Config file is missing required key urls')
        }

        return true
    }

    /**
     * Applies default parameters to the userConfig object, and stores that into the config object
     */
    _defaults() {
        defaultsDeep(this._config, this._userConfig, {
            processMarkdown: true,
            kdf: 'argon2',
            pbkdf2: {
                iterations: 100000
            },
            argon2: {
                iterations: 2,
                memory: 64 * 1024
            }
        })
    }
}

module.exports = Config

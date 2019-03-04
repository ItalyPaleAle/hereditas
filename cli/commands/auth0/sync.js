'use strict'

const {Command} = require('@oclif/command')
const Config = require('../../lib/Config')
const Auth0Management = require('../../lib/Auth0Management')

class Auth0SetupCommand extends Command {
    async run() {
        // Read the config file
        const config = new Config('hereditas.json')
        try {
            await config.load()
        }
        catch (e) {
            this.error(`The current directory ${process.cwd()} doesn't contain a valid Hereditas project`)
            return this.exit(1)
        }

        // Initialize the management client
        const auth0Management = new Auth0Management(config)

        // First step: sync the app on Auth0
        const clientId = await auth0Management.syncClient(config.get('auth0.hereditasClientId'))
        config.set('auth0.hereditasClientId', clientId)

        // Second step: create the rules
        const ruleIds = await auth0Management.syncRules(config.get('auth0.rules'))
        config.set('auth0.rules', ruleIds)

        // Third step: create rule settings
        await auth0Management.updateRulesConfigs()

        // Save config changes
        await config.save()

        this.log('Auth0 configuration updated successfully')
    }
}

// Command description
Auth0SetupCommand.description = `sync the application and rules in Auth0

Synchronizes the status of the resources configured in Auth0: the client (application), the rules and the rule settings.
`

module.exports = Auth0SetupCommand

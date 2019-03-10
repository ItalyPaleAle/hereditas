'use strict'

const {Command} = require('@oclif/command')
const Config = require('../lib/Config')
const Builder = require('../lib/Builder')
const {cli} = require('cli-ux')

class BuildCommand extends Command {
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

        // Make sure that we have an Auth0 client id
        const clientId = config.get('auth0.hereditasClientId')
        if (!clientId) {
            this.error('The Hereditas application hasn\'t been configured on Auth0 yet. Please run `hereditas auth0:sync` first')
            return this.exit(1)
        }

        // Ask for the user passphrase
        const passphrase = await cli.prompt('User passphrase', {type: 'mask'})
        if (!passphrase || passphrase.length < 8) {
            this.error('Passphrase needs to be at least 8 characters long')
            return this.exit(1)
        }

        // Timer
        const startTime = Date.now()

        // Build the project
        const builder = new Builder(passphrase, config)
        await builder.build()

        // Done!
        const duration = (Date.now() - startTime) / 1000

        if (!builder.hasErrors) {
            this.log(`Finished building project in ${config.get('distDir')} (took ${duration} seconds)`)
        }
        else {
            this.error(`Build failed (took ${duration} seconds)`)
        }
    }
}

// Command description
BuildCommand.description = `build an Hereditas project

Build an Hereditas project in the current working directory.
`

module.exports = BuildCommand

'use strict'

const {Command} = require('@oclif/command')
const Config = require('../../lib/Config')

class WebhookGetCommand extends Command {
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

        this.log(config.get('webhookUrl') || 'No webhook configured')
    }
}

// Command description
WebhookGetCommand.description = `Gets the current value for the webhook URL
`

module.exports = WebhookGetCommand

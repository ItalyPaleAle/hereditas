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
WebhookGetCommand.description = `get the current value for the webhook URL

Hereditas configures Auth0 to send a notification when someone successfully authenticates into this Hereditas box. The notification can be used as a warning that the timer has started.

Notifications are sent by invoking a webhook, which can then trigger any action you desire. See the Hereditas documentation for examples and ideas on how to use this feature.

If no webhook is set, Hereditas will not send you notifications on new logins.
`

module.exports = WebhookGetCommand

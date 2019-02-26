'use strict'

const {Command, flags} = require('@oclif/command')
const Config = require('../../lib/Config')

class WebhookSetCommand extends Command {
    async run() {
        const {flags} = this.parse(WebhookSetCommand)

        // Read the config file
        const config = new Config('hereditas.json')
        try {
            await config.load()
        }
        catch (e) {
            this.error(`The current directory ${process.cwd()} doesn't contain a valid Hereditas project`)
            return this.exit(1)
        }

        // Save changes
        config.set('webhookUrl', (flags.url === 'none') ? undefined : flags.url)
        await config.save()
        this.log('Webhook URL updated')
    }
}

// Command description
WebhookSetCommand.description = `Sets the URL for the webhook to notify of new logins
`

// Command-line options
WebhookSetCommand.flags = {
    url: flags.string({
        char: 'u',
        description: 'Webhook url; set to "none" to remove',
        required: true,
    })
}

module.exports = WebhookSetCommand

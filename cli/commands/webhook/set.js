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

        // Notify users that they need to run the auth0:sync command
        this.log('Info: The configuration has been updated locally; for changes to be effective, remember to run `hereditas auth0:sync`')
    }
}

// Command description
WebhookSetCommand.description = `set the webhook URL used to notify of new logins

Hereditas configures Auth0 to send a notification when someone successfully authenticates into this Hereditas box. The notification can be used as a warning that the timer has started.

Notifications are sent by invoking a webhook, which can then trigger any action you desire. See the Hereditas documentation for examples and ideas on how to use this feature.

You can disable notifications by setting \`--url none\` when invoking this command.

After running this command, you will need to synchronize the changes on Auth0 with \`hereditas auth0:sync\` (it's not necessary to re-build or re-deploy the box).
`

// Usage example
WebhookSetCommand.usage = `webhook:set \\
   --url "https://example.com/webhook/token/abc123XYZ"
`

// Command-line options
WebhookSetCommand.flags = {
    url: flags.string({
        char: 'u',
        description: 'webhook URL; set to "none" to remove',
        required: true,
    })
}

module.exports = WebhookSetCommand

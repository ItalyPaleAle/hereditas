'use strict'

const {Command, flags} = require('@oclif/command')
const Config = require('../../lib/Config')

class UrlRmCommand extends Command {
    async run() {
        const {flags} = this.parse(UrlRmCommand)

        // Read the config file
        const config = new Config('hereditas.json')
        try {
            await config.load()
        }
        catch (e) {
            this.error(`The current directory ${process.cwd()} doesn't contain a valid Hereditas project`)
            return this.exit(1)
        }

        // Load the current list
        let urls = config.get('urls')
        if (!urls) {
            urls = []
        }
        else {
            // Remove urls that match
            urls = urls.filter((el) => flags.url.indexOf(el) == -1)
        }

        if (!urls.length) {
            this.error('Cannot remove all URLs from the list')
            return this.exit(1)
        }

        // Save changes
        config.set('urls', urls)
        await config.save()

        this.log('URL list updated')

        // Notify users that they need to run the auth0:sync command
        this.log('Info: The configuration has been updated locally; for changes to be effective, remember to run `hereditas auth0:sync`')
    }
}

// Command description
UrlRmCommand.description = `removes URL(s) from the configuration

These URLs are used by Auth0 to whitelist the pages users are redirected to after authenticating.

After running this command, you will need to synchronize the changes on Auth0 with \`hereditas auth0:sync\` (it's not necessary to re-build or re-deploy the box).
`

// Usage example
UrlRmCommand.usage = `url:rm \\
   --url "https://my.testhereditas.app"
`

// Command-line options
UrlRmCommand.flags = {
    url: flags.string({
        char: 'u',
        description: 'URL to remove (multiple values supported)',
        required: true,
        multiple: true
    })
}

module.exports = UrlRmCommand

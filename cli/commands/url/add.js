'use strict'

const {Command, flags} = require('@oclif/command')
const Config = require('../../lib/Config')

class UrlAddCommand extends Command {
    async run() {
        const {flags} = this.parse(UrlAddCommand)

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

        // Add all new URLs
        for (let i = 0; i < flags.url.length; i++) {
            if (urls.indexOf(flags.url[i]) != -1) {
                this.log(`URL ${flags.url[i]} is already present`)
            }
            else {
                // Add url
                urls.push(flags.url[i])
                this.log(`Added URL ${flags.url[i]}`)
            }
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
UrlAddCommand.description = `add URLs where the box is deployed to, used for OAuth callbacks

Add one or more URLs to the list of addresses where the Hereditas box is deployed to. This information is stored on Auth0 to whitelist URLs where users are redirected after a successful authentication. Note that the protocol (\`http://\` or \`https://\`) needs to match too.

After running this command, you will need to synchronize the changes on Auth0 with \`hereditas auth0:sync\` (it's not necessary to re-build or re-deploy the box).
`

// Usage example
UrlAddCommand.usage = `url:add \\
   --url "https://my.testhereditas.app"
`

// Command-line options
UrlAddCommand.flags = {
    url: flags.string({
        char: 'u',
        description: 'URL where the box is deployed to (multiple values supported)',
        required: true,
        multiple: true
    })
}

module.exports = UrlAddCommand

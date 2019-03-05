'use strict'

const {Command} = require('@oclif/command')
const Config = require('../../lib/Config')

class UrlListCommand extends Command {
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

        // Load all urls
        let urls = config.get('urls')
        if (!urls) {
            urls = []
        }
        this.log(urls.join('\n'))
    }
}

// Command description
UrlListCommand.description = `list URLs where the box is deployed to

Shows the list of URLs where the Hereditas box is deployed to. This list is used by Auth0 to whitelist redirect URLs after users authenticate.
`

module.exports = UrlListCommand

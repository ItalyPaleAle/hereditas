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
UrlListCommand.description = `List URLs for the app
`

module.exports = UrlListCommand

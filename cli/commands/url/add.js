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
    }
}

// Command description
UrlAddCommand.description = `Adds URLs where the app is deployed to, used for OAuth callbacks
`

// Command-line options
UrlAddCommand.flags = {
    url: flags.string({
        char: 'u',
        description: 'URL where the app is deployed to (multiple values supported)',
        required: true,
        multiple: true
    })
}

module.exports = UrlAddCommand

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
    }
}

// Command description
UrlRmCommand.description = `Removes URL(s) from the configuration
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

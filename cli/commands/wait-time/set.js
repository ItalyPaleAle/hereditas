'use strict'

const {Command, flags} = require('@oclif/command')
const Config = require('../../lib/Config')

class WaitTimeSetCommand extends Command {
    async run() {
        const {flags} = this.parse(WaitTimeSetCommand)

        // Read the config file
        const config = new Config('hereditas.json')
        try {
            await config.load()
        }
        catch (e) {
            this.error(`The current directory ${process.cwd()} doesn't contain a valid Hereditas project`)
            return this.exit(1)
        }

        // Get the new value
        const time = parseInt(flags.time || '0', 10)
        if (time < 1) {
            this.error('Wait time must be a number greater than zero')
            return this.exit(1)
        }

        // Save changes
        config.set('waitTime', time)
        await config.save()
        this.log('Wait time updated')
    }
}

// Command description
WaitTimeSetCommand.description = `Configures the wait time (delay normal users need to wait before they can unlock the Hereditas box)
`

// Command-line options
WaitTimeSetCommand.flags = {
    time: flags.string({
        char: 't',
        description: 'Wait time, in seconds',
        required: true,
    })
}

module.exports = WaitTimeSetCommand

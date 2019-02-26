'use strict'

const {Command} = require('@oclif/command')
const Config = require('../../lib/Config')

class WaitTimeGetCommand extends Command {
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

        this.log(config.get('waitTime') + 's')
    }
}

// Command description
WaitTimeGetCommand.description = `Gets the current value for the wait time (delay normal users need to wait before they can unlock the Hereditas box)
`

module.exports = WaitTimeGetCommand

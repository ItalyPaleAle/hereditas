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
WaitTimeGetCommand.description = `get the current value for the wait time

This command returns the current value for the wait time, in seconds.

The wait time is the amount of time for normal users (that don't have the "owner" role) before they can unlock the Hereditas box. Auth0 will not provide users with the "application token" unless the wait time has passed since their first login, preventing them from having the information required to unlock the Hereditas box. If users with the "owner" role authenticate, the timer is automatically stopped.
`

module.exports = WaitTimeGetCommand

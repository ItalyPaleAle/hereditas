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
WaitTimeSetCommand.description = `configure the wait time

This command sets the wait time (in seconds) for this Hereditas box.

The wait time is the amount of time for normal users (that don't have the "owner" role) before they can unlock the Hereditas box. Auth0 will not provide users with the "application token" unless the wait time has passed since their first login, preventing them from having the information required to unlock the Hereditas box. If users with the "owner" role authenticate, the timer is automatically stopped.

After running this command, you will need to synchronize the changes on Auth0 with \`hereditas auth0:sync\` (it's not necessary to re-build or re-deploy the box).
`

// Usage example
WaitTimeSetCommand.usage = `wait-time:set \\
   --time 86400
`

// Command-line options
WaitTimeSetCommand.flags = {
    time: flags.string({
        char: 't',
        description: 'wait time, in seconds',
        required: true,
    })
}

module.exports = WaitTimeSetCommand

'use strict'

const {Command, flags} = require('@oclif/command')
const Config = require('../../lib/Config')

class UserRmCommand extends Command {
    async run() {
        const {flags} = this.parse(UserRmCommand)

        // Read the config file
        const config = new Config('hereditas.json')
        try {
            await config.load()
        }
        catch (e) {
            this.error(`The current directory ${process.cwd()} doesn't contain a valid Hereditas project`)
            return this.exit(1)
        }

        // Load users and remove the requested one
        let users = config.get('users')
        if (!users) {
            users = []
        }
        else {
            users = users.filter((el) => el.email != flags.email)
        }

        // Save
        config.set('users', users)
        await config.save()

        this.log(`Removed user ${flags.email}`)
    }
}

// Command description
UserRmCommand.description = `Adds an authorized user to the app
`

// Command-line options
UserRmCommand.flags = {
    email: flags.string({
        char: 'e',
        description: 'Email address of the user to whitelist',
        required: true
    })
}

module.exports = UserRmCommand

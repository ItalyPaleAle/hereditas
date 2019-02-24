'use strict'

const {Command, flags} = require('@oclif/command')
const Config = require('../../lib/Config')

class UserAddCommand extends Command {
    async run() {
        const {flags} = this.parse(UserAddCommand)

        // Read the config file
        const config = new Config('hereditas.json')
        try {
            await config.load()
        }
        catch (e) {
            this.error(`The current directory ${process.cwd()} doesn't contain a valid Hereditas project`)
            return this.exit(1)
        }

        // Check if the user is already in the configuration
        let users = config.get('users')
        if (!users) {
            users = []
        }
        const added = users.some((el) => el.email == flags.email)
        if (added) {
            this.log(`User ${flags.email} is already authorized`)
            return
        }

        // Add user
        users.push({
            email: flags.email,
            role: flags.role
        })
        config.set('users', users)
        await config.save()

        this.log(`Added user ${flags.email} (role: ${flags.role})`)
    }
}

// Command description
UserAddCommand.description = `Adds an authorized user to the app
`

// Command-line options
UserAddCommand.flags = {
    email: flags.string({
        char: 'e',
        description: 'Email address of the user to whitelist',
        required: true
    }),
    role: flags.string({
        char: 'r',
        options: ['user', 'owner'],
        description: 'Role: normal user or owner',
        default: 'user'
    })
}

module.exports = UserAddCommand

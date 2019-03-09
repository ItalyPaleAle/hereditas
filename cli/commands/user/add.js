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

        // Notify users that they need to run the auth0:sync command
        this.log('Info: The configuration has been updated locally; for changes to be effective, remember to run `hereditas auth0:sync`')
    }
}

// Command description
UserAddCommand.description = `add an authorized user to the box

Whitelist email addresses to allow users to authenticate and access your Hereditas box. If you configure Auth0 to enable social logins (e.g. Google, Facebook and/or Microsoft accounts), users won't need to set up a new account or password, and they can authenticate with their existing social account as long as the email address matches what you've whitelisted.

When you whitelist an email address, you can choose between the "user" role (the default) and the "owner" one. Someone with the "owner" role can access the data in this Hereditas box at any time (provided they have the "user passphrase" too), and when they authenticate, they reset any timer that might have been started by another person with the "user" role.

After running this command, you will need to synchronize the changes on Auth0 with \`hereditas auth0:sync\` (it's not necessary to re-build or re-deploy the box).
`

// Usage example
UserAddCommand.usage = `user:add \\
   --email "someone@example.com"
`

// Command-line options
UserAddCommand.flags = {
    email: flags.string({
        char: 'e',
        description: 'email address of the user to whitelist',
        required: true
    }),
    role: flags.string({
        char: 'r',
        options: ['user', 'owner'],
        description: 'role: user or owner',
        default: 'user'
    })
}

module.exports = UserAddCommand

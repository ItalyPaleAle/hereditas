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
UserRmCommand.description = `remove an authorized user from this box

Removes an email address from the list of those authorized to authenticate with Auth0 for this Hereditas box.

After running this command, you will need to synchronize the changes on Auth0 with \`hereditas auth0:sync\` (it's not necessary to re-build or re-deploy the box).
`

// Usage example
UserRmCommand.usage = `user:rm \\
   --email "someone@example.com"
`

// Command-line options
UserRmCommand.flags = {
    email: flags.string({
        char: 'e',
        description: 'email address of the user to remove from the whitelist',
        required: true
    })
}

module.exports = UserRmCommand

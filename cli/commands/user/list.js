'use strict'

const {Command, flags} = require('@oclif/command')
const Config = require('../../lib/Config')

class UserListCommand extends Command {
    async run() {
        const {flags} = this.parse(UserListCommand)

        // Read the config file
        const config = new Config('hereditas.json')
        try {
            await config.load()
        }
        catch (e) {
            this.error(`The current directory ${process.cwd()} doesn't contain a valid Hereditas project`)
            return this.exit(1)
        }

        // Load all users
        let users = config.get('users')
        if (!users) {
            users = []
        }
        const list = {owners: [], users: []}
        for (let i = 0; i < users.length; i++) {
            if (users[i].role == 'owner') {
                list.owners.push(users[i].email)
            }
            else {
                list.users.push(users[i].email)
            }
        }
        list.owners.sort()
        list.users.sort()

        // Show list
        if (!flags.role) {
            this.log(`\x1b[1mOwners:\x1b[0m\n  ${list.owners.join('\n  ')}`)
            this.log(`\x1b[1mUsers:\x1b[0m\n  ${list.users.join('\n  ')}`)
        }
        else {
            this.log(list[flags.role + 's'].join('\n'))
        }
    }
}

// Command description
UserListCommand.description = `List users that are authorized to use the app
`

// Command-line options
UserListCommand.flags = {
    role: flags.string({
        char: 'r',
        options: ['user', 'owner', ''],
        description: 'Filter by role: normal user or owner',
        default: ''
    })
}

module.exports = UserListCommand

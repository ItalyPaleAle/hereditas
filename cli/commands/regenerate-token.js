'use strict'

const {Command} = require('@oclif/command')
const Config = require('../lib/Config')
const {GenerateToken} = require('../lib/Crypto')

class RegenerateTokenCommand extends Command {
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

        // Generate a new appToken and save it
        const appToken = await GenerateToken(21)
        config.set('appToken', appToken)
        await config.save()

        this.log('New application token saved in the configuration file')

        // Notify users that they need to run the auth0:sync command
        this.log('Info: The new application token will be used for boxes you build from now on, using `hereditas build`; it will not impact existing boxes. Additionally, remember to run `hereditas auth0:sync` to update the application token on Auth0 after deploying the new box.')
    }
}

// Command description
RegenerateTokenCommand.description = `regenerate the application token

Update the "application token", which is part of the encryption key, in the hereditas.json config file, by generating a new random one.

After running this command, you will need to build a new box with \`hereditas build\` and then synchronize the changes on Auth0 with \`hereditas auth0:sync\`.
`

module.exports = RegenerateTokenCommand

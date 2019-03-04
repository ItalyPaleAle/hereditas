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

        this.log('New token saved in the configuration file')
    }
}

// Command description
RegenerateTokenCommand.description = `regenerate the application token

Update the "application token", which is part of the encryption key, in the hereditas.json config file, by generating a new random one.

After running this command, you will need to build a new box with \`hereditas build\` and then synchronize the changes on Auth0 with \`hereditas auth0:sync\`.
`

module.exports = RegenerateTokenCommand

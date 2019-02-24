'use strict'

const {Command} = require('@oclif/command')
const Config = require('../lib/Config')
const Builder = require('../lib/Builder')

class BuildCommand extends Command {
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

        // Timer
        const startTime = Date.now()

        // Build the project
        const builder = new Builder(config)
        await builder.build()

        // Done!
        const duration = (Date.now() - startTime) / 1000

        if (!builder.hasErrors) {
            this.log(`Finished building project in ${config.distDir} (took ${duration} seconds)`)
        }
        else {
            this.error(`Build failed (took ${duration} seconds)`)
        }
    }
}

// Command description
BuildCommand.description = `Builds an Hereditas project
`

module.exports = BuildCommand

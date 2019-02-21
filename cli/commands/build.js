'use strict'

const {Command} = require('@oclif/command')
const {ReadConfig} = require('../lib/utils')
const Builder = require('../lib/builder')

class BuildCommand extends Command {
    async run() {
        // Read the config file
        let config
        try {
            config = await ReadConfig()
        }
        catch (e) {
            this.error(`The current directory ${process.cwd()} doesn't contain a valid Hereditas project`)
            return this.exit(1)
        }

        // Timer
        const startTime = Date.now()

        // Build the project
        const build = new Builder(config)
        await build.build()

        // Done!
        const duration = (Date.now() - startTime) / 1000

        if (!build.hasErrors) {
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

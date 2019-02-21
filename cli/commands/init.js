'use strict'

const {Command, flags} = require('@oclif/command')
const fs = require('fs')
const process = require('process')
const path = require('path')

class InitCommand extends Command {
    async run() {
        const {flags} = this.parse(InitCommand)

        // Check if the folder is empty
        const files = fs.readdirSync('.')
        if (files.length) {
            this.error(`Directory ${process.cwd()} isn't empty; aborting`)
            return this.exit(1)
        }

        // Get the relative paths to the folders
        const contentDir = path.relative('', flags.content)
        const distDir = path.relative('', flags.dist)

        // Create the directories
        fs.mkdirSync(contentDir)
        fs.mkdirSync(distDir)

        // Configuration object
        const configObject = {
            version: 20190215,
            distDir: distDir,
            contentDir: contentDir,
            processMarkdown: true,
            auth0: {
                domain: flags.auth0Domain,
                clientId: flags.auth0ClientId
            }
        }

        // Create a config file
        fs.writeFileSync('hereditas.json', JSON.stringify(configObject, null, 2))

        this.log('Project initialized')
    }
}

// Command description
InitCommand.description = `Initializes a new Hereditas project
`

// Command-line options
InitCommand.flags = {
    content: flags.string({
        char: 'i',
        description: 'Path of the directory with content',
        default: 'content'
    }),
    dist: flags.string({
        char: 'o',
        description: 'Path of the dist directory (where output is saved)',
        default: 'dist'
    }),
    auth0Domain: flags.string({
        char: 'd',
        description: 'Auth0 domain/tenant (e.g. "myhereditas.auth0.com")',
        required: true
    }),
    auth0ClientId: flags.string({
        char: 'c',
        description: 'Auth0 application client id',
        required: true
    })
}

module.exports = InitCommand

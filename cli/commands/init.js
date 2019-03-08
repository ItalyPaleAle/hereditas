'use strict'

const {Command, flags} = require('@oclif/command')
const fs = require('fs')
const util = require('util')
const process = require('process')
const path = require('path')
const Config = require('../lib/Config')
const {GenerateToken} = require('../lib/Crypto')

class InitCommand extends Command {
    async run() {
        const {flags} = this.parse(InitCommand)

        // Check if the folder is empty
        const files = await util.promisify(fs.readdir)('.')
        if (files.length) {
            this.error(`Directory ${process.cwd()} isn't empty; aborting`)
            return this.exit(1)
        }

        // Get the relative paths to the folders
        const contentDir = path.relative('', flags.content)
        const distDir = path.relative('', flags.dist)

        // Create the directories
        const mkdirPromise = util.promisify(fs.mkdir)
        await mkdirPromise(contentDir)
        await mkdirPromise(distDir)

        // Generate an appToken
        const appToken = await GenerateToken(21)

        // Create configuration
        const config = new Config('hereditas.json')
        config.create({
            distDir: distDir,
            contentDir: contentDir,
            auth0: {
                domain: flags.auth0Domain,
                managementClientId: flags.auth0ClientId,
                managementClientSecret: flags.auth0ClientSecret
            },
            urls: flags.url,
            waitTime: 86400,
            appToken
        })
        await config.save()

        this.log('Project initialized')
    }
}

// Command description
InitCommand.description = `initialize a new Hereditas project in the current working directory.

Initialize a new Hereditas project in the current working directory, creating the folders for the content and the generated data, as well as the "hereditas.json" configuration file.

The current working directory needs to be empty, or the command will raise an error.
`

// Usage example
InitCommand.usage = `init \\
   --auth0Domain "yourdomain.auth0.com" \\
   --auth0ClientId "..." \\
   --auth0ClientSecret "..." \\
   --url "https://my.testhereditas.app"
`

// Command-line options
InitCommand.flags = {
    content: flags.string({
        char: 'i',
        description: 'path of the directory with the content',
        default: 'content'
    }),
    dist: flags.string({
        char: 'o',
        description: 'path of the dist directory (where output is saved)',
        default: 'dist'
    }),
    auth0Domain: flags.string({
        char: 'd',
        description: 'Auth0 domain/tenant (e.g. "myhereditas.auth0.com")',
        required: true
    }),
    auth0ClientId: flags.string({
        char: 'c',
        description: 'Auth0 client ID for the management app',
        required: true
    }),
    auth0ClientSecret: flags.string({
        char: 's',
        description: 'Auth0 client secret for the management app',
        required: true
    }),
    url: flags.string({
        char: 'u',
        description: 'URL where the app is deployed to, used for OAuth callbacks (multiple values supported)',
        required: true,
        multiple: true
    })
}

module.exports = InitCommand

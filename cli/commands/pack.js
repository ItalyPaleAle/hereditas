'use strict'

const {Command} = require('@oclif/command')
const Config = require('../lib/Config')
const util = require('util')
const path = require('path')
const fs = require('fs')
const {CleanDirectory} = require('../lib/Utils')

const execPromise = util.promisify(require('child_process').exec)

class PackCommand extends Command {
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

        // Make sure that http://localhost:8080 is allowed as url
        let urls = config.get('urls')
        if (!urls || urls.indexOf('http://localhost:8080') == -1) {
            this.error('Before you can pack a box, the URL `http://localhost:8080` must be allowed. Please run `hereditas url:add -u http://localhost:8080` (and then `hereditas auth0:sync`).')
            return this.exit(1)
        }

        // Check that we have go installed
        try {
            const {stdout} = await execPromise('go version')
            const match = stdout.match(/^go version go1\.([0-9]+)/)
            if (!match || !match[0] || !match[1]) {
                throw Error('Invalid go interpreter')
            }
            const goVersion = parseInt(match[1], 10)
            if (goVersion < 13) {
                throw Error('Go 1.13 or higher is required')
            }
        }
        catch (err) {
            this.error('Go 1.13 or higher must be installed for this command to work.')
            return this.exit(1)
        }

        // Ensure that the GOPATH and HOME are defined
        if (!process.env.GOPATH || !process.env.HOME) {
            this.error('Environmental variables GOPATH and HOME must be defined.')
            return this.exit(1)
        }

        // Check that we have packr2 installed
        try {
            const {stdout} = await execPromise('packr2 version')
            const match = stdout.match(/^v2/)
            if (!match || !match[0]) {
                throw Error('Invalid packr2 version')
            }
        }
        catch (err) {
            this.error('packr2 must be installed for this command to work.\nSee https://github.com/gobuffalo/packr/tree/master/v2')
            return this.exit(1)
        }

        // Check that the Hereditas box is built
        const distDir = config.get('distDir')
        if (!fs.existsSync(path.join(distDir, '_index'))) {
            this.error('This Hereditas box hasn\'t been built yet; please run `hereditas build` first.')
            return this.exit(1)
        }

        // Create a directory for the Go app
        // Or clean it if it exists
        const packPath = path.relative('', 'pack.tmp')
        if (fs.existsSync(packPath)) {
            await CleanDirectory(packPath)
        }
        else {
            fs.mkdirSync(packPath)
        }

        // Copy the Go app's files
        ['main.go', 'go.mod', 'go.sum'].forEach((file) => {
            fs.copyFileSync(
                path.resolve(__dirname, '../../pack/' + file),
                path.join(packPath, file)
            )
        })

        // Create a symlink to distDir inside the packPath
        fs.symlinkSync(path.join('..', distDir), path.join(packPath, 'dist'), 'dir')

        // Run packr2
        await execPromise('packr2', {
            cwd: packPath
        })

        // Build the Go app for all archs
        const archs = {
            'linux-amd64': {
                GOOS: 'linux',
                GOARCH: 'amd64'
            },
            'linux-386': {
                GOOS: 'linux',
                GOARCH: '386'
            },
            'linux-arm64': {
                GOOS: 'linux',
                GOARCH: 'arm64'
            },
            'linux-armv7': {
                GOOS: 'linux',
                GOARCH: 'arm',
                GOARM: '7'
            },
            'macos': {
                GOOS: 'darwin',
                GOARCH: 'amd64'
            },
            'win64.exe': {
                GOOS: 'windows',
                GOARCH: 'amd64'
            },
            'win32.exe': {
                GOOS: 'windows',
                GOARCH: '386'
            }
        }
        for (const extension in archs) {
            if (!archs.hasOwnProperty(extension)) {
                continue
            }

            const file = 'hereditas-box-' + extension
            this.log('Building ' + file)

            // Environmental variables
            const env = Object.assign({
                GOPATH: process.env.GOPATH,
                HOME: process.env.HOME,
                CGO_ENABLED: '0',
                GO111MODULE: 'on'
            }, archs[extension])

            await execPromise('go build -o ' + path.join('..', '_bin', file), {
                cwd: packPath,
                env
            })
        }

        // Delete the temporary folder
        await CleanDirectory(packPath)
        fs.rmdirSync(packPath)

        this.log('Done! Binaries are in the _bin folder')
    }
}

// Command description
PackCommand.description = `pack a box into a self-contained binary

After building a box with Hereditas, the \`hereditas pack\` command allows you to generate a self-contained binary (for Windows, macOS and Linux) that contains your Hereditas box and all of its contents. Depending on your use case, this single binary might be easier to distribute.

Note that this command has some pre-requisites:

- You need to have the Go compiler installed
  (version 1.13 or higher)
- You need to have packr2 installed in your path
  (see https://github.com/gobuffalo/packr/tree/master/v2)
- Your Hereditas box must be already built
  (run \`hereditas build\` beforehand)
- The URL \`http://localhost:8080\` must be allowed for this box
  (run \`hereditas url:add -u http://localhost:8080\`)
`

module.exports = PackCommand

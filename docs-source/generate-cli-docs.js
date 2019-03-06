'use strict'

const Mustache = require('mustache')
const fs = require('fs')
const util = require('util')

// Promisified functions
const readFilePromise = util.promisify(fs.readFile)
const readdirPromise = util.promisify(fs.readdir)
const statPromise = util.promisify(fs.stat)
const writeFilePromise = util.promisify(fs.writeFile)

// Scan a directory recursively and get the file names
const scanFolder = async (base, folder, result) => {
    result = result || []
    folder = folder || ''

    // Scan the list of files and folders, recursively
    const list = await readdirPromise(base + folder)
    for (const e in list) {
        const el = base + folder + list[e]

        // Check if it's a directory
        const stat = await statPromise(el)
        if (!stat) {
            continue
        }

        // If it's a directory, scan it recursively
        if (stat.isDirectory()) {
            await scanFolder(base, folder + list[e] + '/', result)
        }
        // Get only JavaScript files
        else if (el.substr(-3) === '.js') {
            // Add the file to the list
            result.push(folder + list[e])
        }
    }

    return result
}

const commandsPath = __dirname + '/../cli/commands/'
const docTemplateFile = __dirname + '/content/cli/__template.md'
const docDestinationPath = __dirname + '/content/cli/'

// Main entrypoint
;(async function generateCliDocs() {
    // Load the templates
    const docTemplate = await readFilePromise(docTemplateFile, 'utf8')
    Mustache.parse(docTemplate)

    // Load the list of CLI commands
    const commands = await scanFolder(commandsPath)

    // Generate the documentation file for all commands
    const promises = commands.map(async (file) => {
        // Command name is derived from the file name
        const commandName = file.replace('/', ':').slice(0, -3)

        // Import the class
        const command = require(commandsPath + file)

        // Description: first line is the short one, and second line is the long one
        const description = command.description.trim()
        const [shortDescription, ...parts] = description.split('\n')
        const longDescription = parts.join('\n').trim()

        // Usage
        const usage = (command.usage) ?
            'hereditas ' + command.usage.trim() :
            'hereditas ' + commandName

        // Build the documentation file
        const params = {
            commandName,
            shortDescription,
            longDescription,
            usage
        }
        const rendered = Mustache.render(docTemplate, params)
        await writeFilePromise(docDestinationPath + commandName.replace(':', '_') + '.md', rendered)

        // Return the name of the command, which will be used for the index
        return commandName
    })
    const index = await Promise.all(promises)
    console.log(index)
})()

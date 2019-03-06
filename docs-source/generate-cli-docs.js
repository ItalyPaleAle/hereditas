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
const menuTemplateFile = __dirname + '/content/menu/__template.md'
const docDestinationPath = __dirname + '/content/cli/'
const menuDestinationPath = __dirname + '/content/menu/index.md'

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

        // Flags
        const flags = []
        if (command.flags) {
            // Iterate through the flags
            for (const key in command.flags) {
                if (!command.flags.hasOwnProperty(key) || !command.flags[key]) {
                    continue
                }
                const flag = command.flags[key]

                if (flag.type !== 'option') {
                    // eslint-disable-next-line no-console
                    console.warn('Skipping flag with type != "option"')
                    continue
                }

                // Required
                const required = flag.required ? '✓' : ''

                // Flag name and character
                let name = ['--' + key]
                if (flag.char) {
                    name.unshift('-' + flag.char)
                }
                name = '`' + name.join('`<br/>`') + '`'

                // Type (including options)
                const type = (flag.options) ?
                    '`"' + flag.options.join('"`, `"') + '"`' :
                    'string'

                const defaultValue = (flag.default) ?
                    '`"' + flag.default + '"`' :
                    'none'

                // Add the flag
                flags.push({
                    name,
                    description: flag.description,
                    required,
                    defaultValue,
                    type
                })
            }
        }

        // Build the documentation file
        const params = {
            commandName,
            shortDescription,
            longDescription,
            usage,
            hasFlags: !!flags.length,
            flags
        }
        const rendered = Mustache.render(docTemplate, params)
        const outfileName = commandName.replace(':', '_') + '.md'
        await writeFilePromise(docDestinationPath + outfileName, rendered)

        // Return the name of the command and the file, which will be used for the index
        return {
            name: commandName,
            path: outfileName
        }
    })
    const index = await Promise.all(promises)

    // Use the index to build the menu
    const menuTemplate = await readFilePromise(menuTemplateFile, 'utf8')
    const menuRendered = Mustache.render(menuTemplate, {
        index
    })
    await writeFilePromise(menuDestinationPath, menuRendered)
})()

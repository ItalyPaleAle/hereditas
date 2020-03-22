const fs = require('fs')
const util = require('util')
const path = require('path')

const readdirPromise = util.promisify(fs.readdir)
const unlinkPromise = util.promisify(fs.unlink)
const rmdirPromise = util.promisify(fs.rmdir)

/**
 * Deletes all files in a directory, without removing the directory itself.
 *
 * @param {string} directory - Directory to clean
 * @async
 */
async function CleanDirectory(directory) {
    const files = await readdirPromise(directory)
    return Promise.all(files.map(
        (file) => {
            const target = path.join(directory, file)
            const stat = fs.lstatSync(target)
            if (stat.isDirectory()) {
                return CleanDirectory(target)
                    .then(() => rmdirPromise(target))
            }
            return unlinkPromise(target)
        }
    ))
}

module.exports = {
    CleanDirectory
}

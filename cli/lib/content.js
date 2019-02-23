'use strict'

const fs = require('fs')
const {Readable} = require('stream')
const util = require('util')
const path = require('path')

// Marked.js
const marked = util.promisify(require('marked'))

// Promisified fs.readFile, fs.readdir, fs.stat and fs.unlink
const readFilePromise = util.promisify(fs.readFile)

// List of file extensions of images
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']

/**
 * Processes content
 */
class Content {
    /**
     * Constructor
     *
     * @param {HereditasContentFile} el - Content to process
     * @param {HereditasConfig} config - Config object
     */
    constructor(el, config) {
        this._config = config
        this._el = el
        this._inStream = null
    }

    /**
     * Object with the content information, potentially modified
     *
     * @returns {HereditasContentFile} Content information object
     */
    get el() {
        return this._el
    }

    /**
     * Readable stream to the (optionally, pre-processed) content
     *
     * @returns {ReadableStream} Stream with content data
     */
    get inStream() {
        return this._inStream
    }

    /**
     * Pre-processes the content in any way necessary, e.g. converting Markdown into HTML.
     */
    async process() {
        if (this._el.path.match(/\.txt$/i)) {
            await this._processText()
        }
        else if (this._el.path.match(/\.(md|markdown)$/i)) {
            await this._processMarkdown()
        }
        else {
            await this._processBinary()
        }
    }

    /**
     * Processes images and other binary files
     */
    async _processBinary() {
        // Just get a stream to the file on disk
        this._inStream = fs.createReadStream(path.join(this._config.contentDir, this._el.path))

        // Set the display as "image" for images, and "attach" for anything else
        const extension = this._el.path.split('.')
            .pop()
            .toLowerCase()
        this._el.display = (imageExtensions.indexOf(extension) < 0) ?
            'attach' :
            'image'
    }

    /**
     * Processes simple Text files
     */
    async _processText() {
        // Get a stream to the file and display it as text
        this._inStream = fs.createReadStream(path.join(this._config.contentDir, this._el.path))
        this._el.display = 'text'
    }

    /**
     * Processes Markdown files, converting them to HTML
     */
    async _processMarkdown() {
        // Check if we process Markdown into HTML
        if (this._config.processMarkdown) {
            const markdown = await readFilePromise(path.join(this._config.contentDir, this._el.path), 'utf8')
            const html = await marked(markdown)

            // Push the data into a stream
            this._inStream = new Readable()
            this._inStream._read = () => {} // _read is required, but it's a no-op
            this._inStream.push(html, 'utf8')
            this._inStream.push(null) // End

            // Mark the file as pre-processed
            this._el.processed = 'markdown'
            this._el.display = 'html'
            // TODO: Handle different encodings
        }
        else {
            // If not processing them, treat Markdown files as simple text
            await this._processText()
        }
    }
}

module.exports = Content

// Configure how to cache files from KV

// Match by path
export const cachePaths = [
    {
        // JS and CSS files
        // They have a unique hash in the file name
        match: /^\/(js|css)\/(.*?)$/,
        // Cache in the edge for 6 months
        edgeTTL: 86400 * 180,
        // Cache in the browser for 6 months
        browserTTL: 86400 * 180,
        // Not immutable
        immutable: false
    }
]

// Default
export const cacheDefault = {
    // Cache in the edge for 5 minutes
    edgeTTL: 300,
    // Cache in the browser for 10 minutes
    browserTTL: 600,
    // Not immutable
    immutable: false
}

/**
 * Returns the cache settings for a given URL.
 * @param {string} url - URL of the original request
 * @returns {CacheOpts}
 */
export function cacheSettings(urlStr) {
    // Convert to an URL object
    const url = new URL(urlStr)
    if (!url || !url.host) {
        return null
    }

    // Check if there are special cache settings for this URL
    for (let i = 0; i < cachePaths.length; i++) {
        const e = cachePaths[i]
        if (!e || !e.match) {
            continue
        }
        const match = url.pathname.match(e.match)
        if (!match) {
            continue
        }

        // Return the request URL and caching options
        return {
            edgeTTL: e.edgeTTL,
            browserTTL: e.browserTTL,
            immutable: !!e.immutable
        }
    }

    return cacheDefault
}

/**
 * @typedef CacheOpts
 * @type {Object}
 * @property {number} [edgeTTL]
 * @property {number} [browserTTL]
 * @property {boolean} [immutable]
 */

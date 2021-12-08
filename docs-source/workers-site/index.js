import {getAssetFromKV} from '@cloudflare/kv-asset-handler'
import assets from './assets'
import {cacheSettings} from './cache-config'

/* global STORAGE_ACCOUNT, STORAGE_CONTAINER, DOMAINS, PLAUSIBLE_ANALYTICS */

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to debug
 * 2. we will return an error message on exception in your Response rather than the default 404.html page
 */
const DEBUG = false

addEventListener('fetch', (event) => {
    try {
        event.respondWith(handleEvent(event))
    }
    catch (e) {
        if (DEBUG) {
            return event.respondWith(
                new Response(e.message || e.toString(), {
                    status: 500,
                }),
            )
        }
        event.respondWith(new Response('Internal Error', {status: 500}))
    }
})

/**
 * Handles requests coming in from the client
 * @param {Event} event
 * @returns {Promise<Response>} Response object
 */
async function handleEvent(event) {
    const reqUrl = new URL(event.request.url)

    // Check if the URL points to a static asset on Azure Storage
    const useAsset = isAsset(reqUrl)
    if (useAsset) {
        return requestAsset(useAsset)
    }

    // Handle proxy for Plausible if enabled (if PLAUSIBLE_ANALYTICS contains the URL of the Plausible server, with https prefix)
    // 1. Proxy and cache the script (from /pls/index.*.js to ${PLAUSIBLE_ANALYTICS}/js/plausible.outbound-links.js)
    // 2. Proxy (no cache) the message sending the request (from /pls/(event|error) to ${PLAUSIBLE_ANALYTICS}/api/(event|error))
    // Check if the URL is for the Plausible Analytics script
    const path = reqUrl.pathname
    if (PLAUSIBLE_ANALYTICS && path) {
        // Script
        if (/^\/pls\/index(\.[a-fA-F0-9]{1,6})?\.js$/.test(path)) {
            // Request the asset and modify the response to add padding
            return requestAsset(
                {
                    url: PLAUSIBLE_ANALYTICS + '/js/plausible.outbound-links.js',
                    // Cache in the edge for a day and in the browser for 12 hours
                    edgeTTL: 86400,
                    browserTTL: 43200
                },
                async (response) => {
                    // Get the body's text and add padding
                    let text = await response.text()
                    const num = Math.floor(Math.random() * 100000)
                    if (Math.random() < 0.5) {
                        text += `\n;'` + num + `'`
                    } else {
                        text = `'` + num + `';\n` + text
                    }
                    return text
                }
            )
        }

        // APIs
        if (path.startsWith('/pls/api')) {
            // Clone the request but change the URL
            console.log(PLAUSIBLE_ANALYTICS + path.slice(4))
            const newReq = new Request(
                PLAUSIBLE_ANALYTICS + path.slice(4),
                new Request(event.request, {})
            )

            // Set the X-Forwarded-For header
            // Cloudflare automatically adds X-Real-IP and CF-Connecting-IP (and X-Forwarded-Proto), but we need X-Forwarded-For too
            // First, check if the request had an X-Forwarded-For already
            if (!newReq.headers.get('X-Forwarded-For')) {
                // Fallback to CF-Connecting-IP if available
                // Lastly, X-Real-IP
                if (newReq.headers.get('CF-Connecting-IP')) {
                    newReq.headers.set('X-Forwarded-For', newReq.headers.get('CF-Connecting-IP'))
                } else if (newReq.headers.get('X-Real-IP')) {
                    newReq.headers.set('X-Forwarded-For', newReq.headers.get('X-Real-IP'))
                }
            }

            // Need to remove all Cloudflare headers (starting with cf-) and the Host and Cookie headers, or the request will fail
            newReq.headers.delete('Host')
            newReq.headers.delete('Cookie')
            for (const key of newReq.headers.keys()) {
                if (key.startsWith('cf-')) {
                    newReq.headers.delete(key)
                }
            }

            // Make the request
            return fetch(newReq)
        }
    }

    // Request from the KV
    return requestFromKV(event)
}

/**
 * Loads the response from the Workers KV
 * @param {Event} event
 * @returns {Promise<Response>} Response object
 */
async function requestFromKV(event) {
    // Get cache settings for this file
    const cacheOpts = cacheSettings(event.request.url)
    // Options for the request from the KV
    /** @type {import('@cloudflare/kv-asset-handler').Options} */
    const options = {
        // Set custom caching options
        cacheControl: {
            // Add the options
            ...cacheOpts,
            // Use Cloudflare cache
            bypassCache: false,
        }
    }
    if (DEBUG) {
        // Disable caching while in debug mode
        options.cacheControl = {
            bypassCache: true,
            browserTTL: null,
        }
    }

    try {
        const response = await getAssetFromKV(event, options)

        // Set the Cache-Control header for the browser
        setCacheHeader(response.status, response.headers, cacheOpts)

        // Set security headers
        setSecurityHeaders(response.headers)

        return response
    }
    catch (e) {
        // If an error is thrown try to serve the asset at 404.html
        if (!DEBUG) {
            try {
                const notFoundResponse = await getAssetFromKV(event, {
                    mapRequestToAsset: req => new Request((new URL(req.url).origin) + '/404.html', req),
                })

                return new Response(notFoundResponse.body, {...notFoundResponse, status: 404})
            }
            // eslint-disable-next-line no-empty
            catch (e) {}
        }

        return new Response(e.message || e.toString(), {status: 500})
    }
}

/**
 * Requests an asset, optionally caching it in the edge. It also sets the correct headers in the response.
 * @param {object} useAsset
 * @param {(response: Response) => Promise<string>} [modifyBody] Optional method that can modify the response's body
 * @returns {Response} A Response object
 */
async function requestAsset(useAsset, modifyBody) {
    // Caching options
    const cfOpts = {}
    if (useAsset.edgeTTL) {
        // Cache everything, even if the response has no TTL
        cfOpts.cacheEverything = true
        cfOpts.cacheTtlByStatus = {
            '200-299': useAsset.edgeTTL,
            404: 3,
            '500-599': 0
        }
    }

    // Return a fetch invocation (promise) that retrieves data from the origin
    let response = await fetch(useAsset.url, {
        cf: cfOpts
    })

    // See if we want to modify the response's body
    let body = response.body
    if (modifyBody) {
        body = await modifyBody(response)
    }

    // Reconstruct the Response object to make its headers mutable
    response = new Response(body, response)

    // Delete all Azure Storage headers (x-ms-*)
    for (const key of response.headers.keys()) {
        if (key.startsWith('x-ms-')) {
            response.headers.delete(key)
        }
    }

    // Set the Cache-Control header for the browser
    setCacheHeader(response.status, response.headers, useAsset)

    // Set security headers
    setSecurityHeaders(response.headers)

    // Return the data we requested (and cached)
    return response
}

/**
 * Sets the Cache-Control header for the browser if needed
 * @param {number} statusCode
 * @param {Headers} headers
 * @param {CacheOpts} cacheOpts
 */
function setCacheHeader(statusCode, headers, cacheOpts) {
    if (statusCode >= 200 && statusCode <= 299 && cacheOpts.browserTTL) {
        let val = 'public,max-age=' + cacheOpts.browserTTL
        if (cacheOpts.immutable) {
            val += ',immutable'
        }
        headers.set('Cache-Control', val)
    } else {
        headers.delete('Cache-Control')
    }
}

/**
 * Sets some security headers
 * @param {Headers} headers
 */
function setSecurityHeaders(headers) {
    // Opt out of FLoC
    let policy = headers.get('Permissions-Policy')
    policy = (policy ? policy + '; ' : '') + 'interest-cohort=()'
    headers.set('Permissions-Policy', policy)

    // Referrer policy
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Set CSP (and X-Frame-Options) for HTML pages only
    const ct = headers.get('Content-Type')
    if (ct && ct == 'text/html' || ct.startsWith('text/html;')) {
        // Allow using in frames on the same origin only
        headers.set('X-Frame-Options', 'SAMEORIGIN')
    }
}

/**
 * Check if the requested URL corresponds to an asset in Azure Storage
 * @param {URL} url - URL of the original request
 */
function isAsset(url) {
    for (let i = 0; i < assets.length; i++) {
        const e = assets[i]
        if (!e || !e.match) {
            continue
        }
        const match = url.pathname.match(e.match)
        if (!match) {
            continue
        }

        // New request URL
        const assetUrl = 'https://' + STORAGE_ACCOUNT + '.blob.core.windows.net/' + STORAGE_CONTAINER + e.storagePath.replace(/\$([1-9][0-9]*)/g, (m) => {
            const index = parseInt(m.substr(1), 10)
            return match[index] || ''
        })

        // Return the request URL and caching options
        return {
            url: assetUrl,
            edgeTTL: e.edgeTTL,
            browserTTL: e.browserTTL,
            immutable: !!e.immutable
        }
    }

    return false
}

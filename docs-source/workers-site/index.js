import {getAssetFromKV} from '@cloudflare/kv-asset-handler'
import assets from './assets'

/* global STORAGE_ACCOUNT, STORAGE_CONTAINER, DOMAINS */

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
    // Check if we need to redirect the user
    const redirect = shouldRedirect(event)
    if (redirect) {
        return Response.redirect(redirect, 301)
    }

    // Check if the URL points to a static asset on Azure Storage
    const useAsset = isAsset(event.request.url)
    if (useAsset) {
        return requestAsset(useAsset)
    }

    // Request from the KV
    return requestFromKV(event)
}

/**
 * Checks if the user should be redirected, and returns the address.
 * Redirects from http to https, and from secondary domains (not in the DOMAINS environmental variable) to the primary one
 *
 * @param {Event} event
 * @returns {string|null} If the user should be redirected, return the location
 */
function shouldRedirect(event) {
    // Check the requested URL
    const url = new URL(event.request.url)
    if (!url || !url.host) {
        return null
    }

    // Ensure we're using https
    let redirect = null
    if (url.protocol != 'https:') {
        redirect = 'https://' + url.host + url.pathname + url.search
    }

    // If there's no list of allowed domains (as an env var, for this environment), return right away
    if (typeof DOMAINS == 'undefined' || !DOMAINS) {
        return redirect
    }

    // Look at the list of domains to see if the one being requested is allowed
    /** @type Array<string> */
    const domainList = DOMAINS.split(' ')
    if (domainList.includes(url.host)) {
        // Domain is in the allow-list, so just return
        return redirect
    }

    // Redirect to the first domain in the list
    return 'https://' + domainList[0] + url.pathname + url.search
}

/**
 * Loads the response from the Workers KV
 * @param {Event} event
 * @returns {Promise<Response>} Response object
 */
async function requestFromKV(event) {
    // Options for the request from the KV
    /** @type {import('@cloudflare/kv-asset-handler').Options} */
    const options = {
        // Set custom caching options
        cacheControl: {
            // Use Cloudflare cache
            bypassCache: false,
            // Cache for 1 day in browsers
            browserTTL: 86400,
            // Cache for 2 days in the edge
            edgeTTL: 86400 * 2,
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
        return await getAssetFromKV(event, options)
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

async function requestAsset(useAsset) {
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

    // Return a fetch invocation (promise) that retrieves data from Azure Storage
    let response = await fetch(useAsset.url, cfOpts)

    // Reconstruct the Response object to make its headers mutable
    response = new Response(response.body, response)

    // Delete all Azure Storage headers (x-ms-*)
    for (const key of response.headers.keys()) {
        if (key.startsWith('x-ms-')) {
            response.headers.delete(key)
        }
    }

    // Check if we need to set a Cache-Control for the browser
    if (response.status >= 200 && response.status <= 299 && useAsset.browserTTL) {
        response.headers.set('Cache-Control', 'max-age=' + useAsset.browserTTL)
    }

    // Return the data we requested (and cached)
    return response
}

/**
 * Check if the requested URL corresponds to an asset in Azure Storage
 * @param {string} urlStr - URL of the original request, as string
 */
function isAsset(urlStr) {
    const url = new URL(urlStr)
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
            browserTTL: e.browserTTL
        }
    }

    return false
}

import App from './layout/App.html'
import credentials from './lib/Credentials'
import {Box} from './lib/Box'
import {AuthenticationAttempts} from './lib/Credentials'
import {Store} from 'svelte/store.js'
import {createHashHistory} from '../vendor/svelte-routing'

import './main.scss'

const attempts = new AuthenticationAttempts()

async function handleSession() {
    // Check if we have an id_token
    if (window.location.hash) {
        const match = window.location.hash.match(/id_token=(([A-Za-z0-9\-_~+/]+)\.([A-Za-z0-9\-_~+/]+)(?:\.([A-Za-z0-9\-_~+/]+)))/)
        if (match && match[1]) {
            // First thing: remove the token from the URL (for security)
            history.replaceState(undefined, undefined, '#')

            // Validate and store the JWT
            // If there's an error, redirect to auth page
            try {
                await credentials.setToken(match[1])

                // Reset attempts counter
                attempts.resetAttempts()
            }
            catch (error) {
                console.error('Token error', error)

                return false
            }
        }
    }

    // If we have credentials stored, redirect the user to the authentication page
    if (!credentials.getToken()) {
        return false
    }

    // Get the profile
    // If there's no session or it has expired, redirect to auth page
    let profile
    try {
        profile = await credentials.getProfile()
    }
    catch (error) {
        console.error('Token error', error)

        return false
    }

    return profile
}

const app = (async function() {
    // Load profile and check session
    const profile = await handleSession()
    let hereditasProfile = null
    let box = null

    // If we're not authenticated, and this is the first attempt, automatically redirect users
    if (!profile) {
        if (attempts.increaseAttempts() < 1) {
            window.location.href = credentials.authorizationUrl()
            return
        }
    }
    else {
        // Hereditas profile (from the profile)
        hereditasProfile = profile[process.env.ID_TOKEN_NAMESPACE] || {}

        // Check if we have an app token
        if (hereditasProfile.token) {
            try {
                // Create a new box and fetch the index
                box = new Box()

                // Fetch the index asynchronously and do not wait for completion
                box.fetchIndex()
            }
            catch (err) {
                console.error('Error while requesting box\'s data', err)
            }
        }
    }

    // Create a Store for the Svelte app
    const store = new Store({
        profile,
        hereditasProfile,
        box
    })

    // Hash-based history for svelte-routing
    createHashHistory()

    // Crete a Svelte app by loading the main view
    return new App({
        target: document.body,
        store
    })
})()

export default app

// CSS
import '../vendor/bootstrap/css/bootstrap.min.css'

// JavaScript modules
import App from './layout/App.html'
import credentials from './lib/Credentials'
import queryString from 'query-string'
import {Box} from './lib/Box'
import {AuthenticationAttempts} from './lib/Credentials'
import {Store} from 'svelte/store.js'
import {createHashHistory} from '../vendor/svelte-routing'

// Import routes
import routes from './routes'

// Style
import './main.scss'

const attempts = new AuthenticationAttempts()

function getHash() {
    let hash = window.location.hash
    if (hash && hash.length > 2) {
        // Remove the leading # and / characters
        if (hash.charAt(0) == '#') {
            hash = hash.substr(1)
        }
        if (hash.charAt(0) == '/') {
            hash = hash.substr(1)
        }
        const parsed = queryString.parse(hash)

        // Remove the information from the URL (for security, in case it contains an id_token)
        history.replaceState(undefined, undefined, '#')

        return parsed
    }
    else {
        return null
    }
}

function checkAuthError(hash) {
    // Check if we have an error from the authentication server
    if (hash && hash.error) {
        // Check for the error type
        if (hash.error == 'unauthorized') {
            return hash.error_description || 'Unauthorized'
        }
        else {
            return hash.error_description || hash.error
        }
    }

    return false
}

async function handleSession(hash) {
    // Check if we have an id_token
    if (hash && hash.id_token) {
        // Validate and store the JWT
        // If there's an error, redirect to auth page
        try {
            await credentials.setToken(hash.id_token)

            // Reset attempts counter
            attempts.resetAttempts()
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Token error', error)

            throw Error('Token error')
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
        // eslint-disable-next-line no-console
        console.error('Token error', error)

        throw Error('Token error')
    }

    return profile
}

const app = (async function() {
    let profile
    let hereditasProfile = null
    let box = null

    // Parse the hash if any
    const hash = getHash()

    // Check if we have an error from the authentication server
    let unrecoverableError = checkAuthError(hash)
    if (!unrecoverableError) {
        // Load profile and check session
        try {
            profile = await handleSession(hash)
        }
        catch (err) {
            profile = false
            unrecoverableError = err
        }

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
                    // eslint-disable-next-line no-console
                    console.error('Error while requesting box\'s data', err)
                }
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
        store,
        data: {
            unrecoverableError,
            routes
        }
    })
})()

export default app

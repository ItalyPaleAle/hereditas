// CSS
import '../vendor/bootstrap/css/bootstrap.min.css'

// JavaScript modules
import App from './layout/App.svelte'
import credentials from './lib/Credentials'
import qs from 'qs'
import {Box} from './lib/Box'

// Import stores
import {profile, hereditasProfile, box, authError} from './stores'

// Style
import './main.scss'

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
        const parsed = qs.parse(hash, {
            depth: 1,
            parameterLimit: 20,
            ignoreQueryPrefix: true,
        })

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

    return null
}

async function handleSession(hash) {
    // Check if we have an id_token
    if (hash && hash.id_token) {
        // Validate and store the JWT
        // If there's an error, redirect to auth page
        try {
            await credentials.setToken(hash.id_token)
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
    let profileData
    try {
        profileData = await credentials.getProfile()
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('Token error', error)

        throw Error('Token error')
    }

    return profileData
}

const app = (async function() {
    let _profile
    let _hereditasProfile = null
    let _box = null

    // Parse the hash if any
    const hash = getHash()

    // Check if we have an error from the authentication server
    let unrecoverableError = checkAuthError(hash)
    if (!unrecoverableError) {
        // Load profile and check session
        try {
            _profile = await handleSession(hash)
        }
        catch (err) {
            _profile = null
            unrecoverableError = err
        }

        // Hereditas profile (from the profile)
        if (_profile) {
            // Hereditas profile (from the profile)
            _hereditasProfile = _profile[process.env.ID_TOKEN_NAMESPACE] || {}

            // Check if we have an app token
            if (_hereditasProfile.token) {
                try {
                    // Create a new box and fetch the index
                    _box = new Box()

                    // Fetch the index asynchronously and do not wait for completion
                    _box.fetchIndex()
                }
                catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Error while requesting box\'s data', err)
                }
            }
        }
    }

    // Store the profile, hereditasProfile and box into Svelte stores
    profile.set(_profile)
    hereditasProfile.set(_hereditasProfile)
    box.set(_box)
    authError.set(unrecoverableError)

    // Crete a Svelte app by loading the main view
    return new App({
        target: document.body
    })
})()

export default app

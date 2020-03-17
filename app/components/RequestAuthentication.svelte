{#if $authError}
    <h1>Authentication error</h1>
    <p><b>Error description:</b> {$authError}</p>
    <a href={authUrl} class="btn btn-primary">Try authenticating again</a>
{:else}
    <h1>Welcome to this Hereditas box</h1>
    <a href={authUrl} class="btn btn-primary">Authenticate</a>
{/if}

<script>
// Libs
import credentials from '../lib/Credentials'

// Stores
import {profile, authError} from '../stores'

// Generate authentication url
let authUrl = undefined
$: {
    // If we're not authenticated, request a URL
    authUrl = $profile ? undefined : credentials.authorizationUrl()
}
</script>

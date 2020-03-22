{#if $authError}
    <h1>Authentication error</h1>
    <p class="mb-2"><b>Error description:</b> {$authError}</p>
    <a href={authUrl} class="bg-blue-500 hover:bg-blue-700 text-white no-underline font-bold py-2 px-4 rounded">Try authenticating again</a>
{:else}
    <h1>Authenticate with this Hereditas box</h1>
    <a href={authUrl} class="bg-blue-500 hover:bg-blue-700 text-white no-underline font-bold py-2 px-4 rounded">Authenticate</a>
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

<h1>Authentication error</h1>
{#if error}
    <p><b>Error description:</b> {error}</p>
{:else}
    <p>Your session has expired, or you've run into an unspecified authentication error.</p>
{/if}
<a href={authUrl} class="btn btn-primary">Try authenticating again</a>

<script>
// Libs
import credentials from '../lib/Credentials'

// Stores
import {profile} from '../stores'

// Props
export const error = null

// Generate authentication url
let authUrl = undefined
$: {
    // If we're not authenticated, request a URL
    authUrl = $profile ? undefined : credentials.authorizationUrl()
}
</script>

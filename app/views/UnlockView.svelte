{#if $profile}
    <UserProfile />
{:else}
    <RequestAuthentication />
{/if}

<h1 class="mb-4">About this page</h1>
<section class="markdown mt-4">
  {@html welcome}
</section>

<script>
// Libs
import {onMount} from 'svelte'
import {replace} from 'svelte-spa-router'

// Components
import UserProfile from '../components/UserProfile.svelte'
import RequestAuthentication from '../components/RequestAuthentication.svelte'

// Stores
import {box, profile} from '../stores'

// Props
export const welcome = process.env.WELCOME_MD

// If box has already been unlocked, just go straight to the list
onMount(() => {
    if ($box && $box.isUnlocked()) {
        replace('/list')
    }
})
</script>

{#if $profile}
    <UserProfile />
{:else}
    <RequestAuthentication />
{/if}

<section class="welcome">
{@html welcome}
</section>

<style>
.welcome {
    margin: 0.5em 1em 0 1em;
    padding: 1em;
    border: 1px solid #333333;
    color: #333333;
}
</style>

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

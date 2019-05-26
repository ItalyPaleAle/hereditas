<h1>Hello, {$profile.name}!</h1>
{#if $hereditasProfile.role == 'owner'}
    <p>You're the owner of this Hereditas box, so you can unlock it at any time.</p>
    <p class="alert alert-info" role="alert">By logging in, you have stopped the timer for the waiting period before other users can unlock your box.</p>
    <PassphraseBox />
{:else}
    {#if $hereditasProfile.token}
        <p>You can now access to the content of this Hereditas.</p>
        <PassphraseBox />
    {:else}
        <p class="alert alert-info" role="alert">Thanks for requesting access. This Hereditas box will be unlocked on <b>{unlockedDate.toLocaleString()}</b>. Please check later.<br/>
        Important: if an owner signs in with their account, this Hereditas will be locked again.</p>
    {/if}
{/if}

<script>
// Components
import PassphraseBox from './PassphraseBox.svelte'

// Stores
import {profile, hereditasProfile} from '../stores'

// Unlocked date
let unlockedDate = new Date()
$: {
    // Get the date at which this Hereditas instance is unlocked
    unlockedDate = new Date(($hereditasProfile.requestTime + $hereditasProfile.waitTime) * 1000)
}
</script>

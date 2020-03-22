{#await $box.fetchIndex()}
    <p>Fetching index, please wait…</p>
{:then response}
    <form class="w-full max-w-md" on:submit|preventDefault={handleSubmit}>
        <div class="md:flex md:items-center mb-6">
            <div class="md:w-1/3">
                <label class="block md:text-right mb-1 md:mb-0 pr-4" for="inputPassphrase">
                    Unlock passphrase:
                </label>
            </div>
            <div class="md:w-2/3">
                <input class="bg-white appearance-none border {unlockError ? 'border-red-500' : 'border-gray-200'} rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500" id="inputPassphrase" bind:value={passphrase} type="password" placeholder="•••••••" />
                {#if unlockError}
                    <p class="text-xs text-red-500">This passphrase isn't correct</p>
                {/if}
            </div>
        </div>
        <div class="md:flex md:items-center">
            <div class="md:w-1/3"></div>
            <div class="md:w-2/3">
                <button class="bg-blue-500 hover:bg-blue-700 text-white no-underline font-bold py-2 px-4 rounded" type="submit">
                    Browse this Hereditas
                </button>
            </div>
        </div>
    </form>

{:catch error}
    <p>Error while fetching the index: {error}</p>
{/await}

<script>
// Libs
import {replace} from 'svelte-spa-router'

// Stores
import {box, hereditasProfile} from '../stores'

// Props
let passphrase = ''
let unlockError = false

// Form submit handler
function handleSubmit() {
    unlockError = false
    $box.unlock(passphrase, $hereditasProfile.token)
        .then((_) => {
            unlockError = false

            // Redirect to the list
            replace('/list')
        })
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('err caught', err)
            unlockError = true
        })
}
</script>

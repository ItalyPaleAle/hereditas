{#await $box.fetchIndex()}
    <p>Fetching index, please wait…</p>
{:then response}
    <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group row">
            <label for="inputPassphrase" class="col-sm-4 col-form-label">Unlock passphrase:</label>
            <div class="col-sm-8">
                <input type="password" class="form-control {unlockError ? 'is-invalid' : ''}" id="inputPassphrase" bind:value={passphrase} />
                <div class="invalid-feedback">
                    The passphrase isn't correct.
                </div>
            </div>
        </div>
        <div class="form-group row">
            <div class="col-sm-8">
                <button type="submit" class="btn btn-primary">Browse this Hereditas</button>
            </div>
        </div>
    </form>
{:catch error}
    <p>Error while fetching the index: {error}</p>
{/await}

<script type="text/javascript">
// Libs
import {replace} from 'svelte-spa-router'

// Stores
import {box, hereditasProfile} from '../stores'

// Props
let passphrase = ''
let unlockError = false

// Form submit handler
function handleSubmit() {
    $box.unlock(passphrase, $hereditasProfile.token)
        .then((_) => {
            unlockError = false

            // Redirect to the list
            replace('/list')
        })
        .catch((err) => {
            console.error('err caught', err)
            unlockError = true
        })
}
</script>

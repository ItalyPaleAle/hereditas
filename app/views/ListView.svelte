<nav aria-label="breadcrumb">
    <ol class="breadcrumb">
        {#if list.paths && list.paths.length}
            <li class="breadcrumb-item"><a href="/list/" use:link>home</a></li>
            {#each list.paths as path, i (path)}
                {#if i == (list.paths.length - 1)}
                    <li class="breadcrumb-item active" aria-current="page">{path}</li>
                {:else}
                    <li class="breadcrumb-item"><a href="/list/{list.paths.slice(0, i + 1).join('/') + '/'}" use:link>{path}</a></li>
                {/if}
            {/each}
        {:else}
            <li class="breadcrumb-item active" aria-current="page">home</li>
        {/if}
    </ol>
</nav>

<table class="table table-striped">
    <thead>
        <tr>
        <th scope="col">Name</th>
        </tr>
    </thead>
    <tbody>
    {#each list.folders as folder (folder)}
        <tr>
            <td><a href="/list/{list.prefix ? list.prefix + '/' : ''}{folder}" use:link>{folder}</a></td>
        </tr>
    {/each}
    {#each list.files as file (file.dist)}
        <tr>
            <td><a href="/content/{file.dist}" use:link>{file.name}</a></td>
        </tr>
    {/each}
    </tbody>
</table>


<script>
// Libs
import {link, replace} from 'svelte-spa-router'
import {onMount} from 'svelte'

// Stores
import {box} from '../stores'

// Props
// Params from the route, which includes the prefix
export let params = {}

// List of contents
const list = {
    files: [],
    folders: [],
    paths: [],
    prefix: ''
}
$: {
    // Check if we have a prefix (folder)
    list.prefix = (params && params.wild) || ''
    if (list.prefix.charAt(list.prefix.length - 1) == '/') {
        list.prefix = list.prefix.substring(0, list.prefix.length - 1)
    }

    // Get the list
    const contents = $box.getContents()
    const files = []
    const folders = []
    for (const i in contents) {
        // Skip items that don't match the prefix
        const el = contents[i]
        if (list.prefix && el.path.substring(0, list.prefix.length) !== list.prefix) {
            continue
        }

        // Check if it's a file or folder
        const parts = el.path.substring(list.prefix.length)
            .split('/') // Split paths
            .filter((el) => !!el) // Remove empty values
        if (parts.length > 1) {
            // This is a folder. Check if it's in the list already
            const folder = parts[0]
            if (folders.indexOf(folder) < 0) {
                folders.push(parts[0])
            }
        }
        else {
            files.push({
                name: parts[0],
                dist: el.dist
            })
        }
    }
    list.folders = folders
    list.files = files
    list.paths = list.prefix ? list.prefix.split('/') : []
}

// Ensure that we have unlocked the box
onMount(() => {
    if (!$box || !$box.isUnlocked()) {
        replace('/')
    }
})
</script>

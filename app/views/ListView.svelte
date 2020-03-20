<nav aria-label="breadcrumb" class="mb-4">
    <ol class="list-none p-0 inline-flex">
        {#if list.paths && list.paths.length}
            <li class="flex items-center">
                <a href="/list/" use:link>home</a>
                <span class="px-1">&gt;</span>
            </li>
            {#each list.paths as path, i (path)}
                {#if i == (list.paths.length - 1)}
                    <li class="text-gray-600" aria-current="page">{path}</li>
                {:else}
                    <li class="flex items-center">
                        <a href="/list/{list.paths.slice(0, i + 1).join('/') + '/'}" use:link>{path}</a>
                        <span class="px-1">&gt;</span>
                    </li>
                {/if}
            {/each}
        {:else}
            <li class="text-gray-600" aria-current="page">home</li>
        {/if}
    </ol>
</nav>

<div class="bg-white w-full max-w-lg p-4 rounded">
    <table class="table-auto w-full">
        <thead>
            <tr>
                <th scope="col">Name</th>
            </tr>
        </thead>
        <tbody>
        {#each list.folders as folder (folder)}
            <tr class="{(list.i++ % 2) ? 'bg-gray-100' : ''}">
                <td class="border px-4 py-2">
                    <a href="/list/{list.prefix ? list.prefix + '/' : ''}{folder}" use:link>{folder}</a>
                </td>
            </tr>
        {/each}
        {#each list.files as file (file.dist)}
            <tr class="{(list.i++ % 2) ? 'bg-gray-100' : ''}">
                <td class="border px-4 py-2">
                    <a href="/content/{file.dist}" use:link>{file.name}</a>
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
</div>

<script>
// Libs
import {link, replace} from 'svelte-spa-router'
import {onMount} from 'svelte'

// Stores
import {box} from '../stores'

// Props
// Params from the route, which includes the prefix
export let params = {}

let i = 0

// List of contents
const list = {
    files: [],
    folders: [],
    paths: [],
    prefix: '',
    i: 0
}
$: {
    // Check if we have a prefix (folder)
    list.prefix = (params && params.wild) || ''
    if (list.prefix.charAt(list.prefix.length - 1) == '/') {
        list.prefix = list.prefix.substring(0, list.prefix.length - 1)
    }

    // Replace %20 with a space
    list.prefix = list.prefix.replace(/%20/g, ' ')

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
    list.i = 0
    console.log(list)
}

// Ensure that we have unlocked the box
onMount(() => {
    if (!$box || !$box.isUnlocked()) {
        replace('/')
    }
})
</script>

{#await contentPromise}
    Loading...
{:then content}
    <nav aria-label="breadcrumb" class="mb-4">
        <ol class="list-none p-0 inline-flex">
            <li class="flex items-center">
                <a href="/list/" use:link>home</a>
                <span class="px-1">&gt;</span>
            </li>
            {#each content.path as path, i}
                <li class="flex items-center">
                    <a href="/list/{content.path.slice(0, i + 1).join('/') + '/'}" use:link>{path}</a>
                    <span class="px-1">&gt;</span>
                </li>
            {/each}
            <li class="text-gray-600" aria-current="page">{content.name}</li>
        </ol>
    </nav>

    {#if content.display == 'text'}
        <section class="rendered">
            <pre class="w-full whitespace-pre-wrap">{content.text}</pre>
        </section>
    {:else if content.display == 'html'}
        <section class="rendered">
            {@html content.text}
        </section>
    {:else if content.display == 'image'}
        <img src="{content.blob}" alt="{content.name}" class="img-fluid" />
    {:else}
        Download: <a href="{content.blob}" download="{content.name}">{content.name}</a>
    {/if}
{:catch error}
    Error: {error}
{/await}


<script>
// Libs
import {link, replace} from 'svelte-spa-router'
import {onMount} from 'svelte'

// Stores
import {box} from '../stores'

// Props
// Params from the route, which includes the element id
export let params = {}

// Promise that returns the content (note the IIFE)
const contentPromise = (() => {
    // Get the name of the element
    // The element variable should be an id, a hex string of 24 chars
    const elementId = (params && params.element) || ''
    if (!elementId || !elementId.match(/^[0-9a-f]{24}$/)) {
        return Promise.reject('Invalid content')
    }

    // Get info on the content
    const contents = $box.getContents()

    // Get the tag from the index
    let element
    for (const i in contents) {
        if (contents[i].dist == elementId) {
            element = contents[i]
            break
        }
    }
    if (!element) {
        return Promise.reject('Content not found')
    }

    // Fetch the data
    return $box.fetchContent(element)
        .then((result) => {
            // Build the URL for attachments and images, and get the file name
            if (result.display != 'text' && result.display != 'html') {
                // Convert data to a Blob
                result.blob = URL.createObjectURL(new Blob([result.data], {type: 'octet/stream'}))
                delete result.data
            }

            // Get the path components
            result.path = element.path.split('/')
            result.name = result.path.pop()

            return result
        })
        .catch((error) => {
            // Log the error
            // eslint-disable-next-line no-console
            console.error(error)

            return error
        })
})()

// Ensure that we have unlocked the box
onMount(() => {
    if (!$box || !$box.isUnlocked()) {
        replace('/')
    }
})
</script>

// Import routes
import UnlockView from './views/UnlockView.svelte'
import ListView from './views/ListView.svelte'
import ContentView from './views/ContentView.svelte'

// Map of all routes
export default {
    '/': UnlockView,
    '/list/*': ListView,
    '/list': ListView,
    '/content/:element': ContentView
}

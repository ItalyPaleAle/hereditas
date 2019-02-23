// Import routes
import UnlockView from './views/UnlockView.html'
import ListView from './views/ListView.html'
import ContentView from './views/ContentView.html'

// Map of all routes
export default [
    {
        path: '/',
        exact: true,
        component: UnlockView
    },
    {
        path: '/list/:prefix',
        exact: true,
        component: ListView
    },
    {
        path: '/list',
        exact: true,
        component: ListView
    },
    {
        path: '/content/:element',
        exact: true,
        component: ContentView
    }
]

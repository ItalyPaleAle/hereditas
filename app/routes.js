// Import routes
import UnlockView from './views/UnlockView.html'
import ListView from './views/ListView.html'

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
    }
]

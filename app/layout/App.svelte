<Navbar />

<div class="container w-full lg:w-3/5 px-2 pt-10 lg:pt-10 mt-10">
    <Router {routes}/>
</div>

<script>
// Components
import RequestAuthentication from '../components/RequestAuthentication.svelte'
import Navbar from '../components/Navbar.svelte'

// Router and routes
import Router from 'svelte-spa-router'
import routes from '../routes'
</script>

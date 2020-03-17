<nav class="navbar navbar-light bg-light">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12">
                <span class="navbar-brand mb-0 h1">{$pageTitle}</span>
            </div>
        </div>
    </div>
</nav>

<div class="container">
    <div class="row justify-content-center">
        <div class="col-12">
            <Router {routes}/>
        </div>
    </div>
</div>

<script>
// Components
import RequestAuthentication from '../components/RequestAuthentication.svelte'

// Router and routes
import Router from 'svelte-spa-router'
import routes from '../routes'

// Stores
import {pageTitle} from '../stores'
</script>

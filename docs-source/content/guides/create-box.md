---
title: Create the box
type: docs
---

# Create the box

After gathering all the content you want to encrypt, setting up our "API Access" application on Auth0, and configuring a webhook endpoints to send notifications, we can now create a box on our laptop. This will be our "working directory".

## Initialize a working directory

Create a **new, empty folder** on your laptop. Open a terminal inside that folder, then run:

````sh
hereditas init \
   --auth0Domain "yourdomain.auth0.com" \
   --auth0ClientId "..." \
   --auth0ClientSecret "..." \
   --url "http://localhost:5000"
````

You'll need to pass some options to the command above:

- `--auth0Domain` is your domain on Auth0, created in the previous step
- Set `--auth0ClientId` and `--auth0ClientSecret` to the Client Id and Client Secret for the "API Access" app you just created in Auth0
- `--url` is the URL where the app will be deployed to. We'll be testing locally before deploying the app, so for now you might just want to keep this to `http://localhost:5000`. We can always change this later, without having to re-build the Hereditas box.

After running the command, you'll see that your folder now contains three objects:

````text
~/hereditas $ ls
content
dist
hereditas.json
welcome.md
````

- The `content` folder is where you store the data you wish to encrypt
- The `dist` folder will contain the generated web app
- The `hereditas.json` file contains the configuration for the Hereditas box
- The `welcome.md` file contains a welcome message that is displayed in the login page; this file is not encrypted.

> In most cases you will not need to manually edit the `hereditas.json` configuration file, as you can use the Hereditas CLI to change the most common options. However, you can find the full reference for the configuration file in the [Configuration file]({{< relref "/advanced/configuration-file.md" >}}) article.

## Content

Place all the content you want to encrypt in the `content` folder. You can store any kind of file in this folder and sub-folders. The [Get started]({{< relref "/guides/get-started.md" >}}#step-zero-gather-all-content) article has some suggestions on what kind of content to store.

Markdown documents are automatically converted to HTML chunks, so that's a great way to include information. However, at present Hereditas web apps do not support hyperlinks, images or videos in Markdown or HTML files linking to other content within the box.

### Welcome file

As mentioned above, Hereditas generates a `welcome.md` file and pre-populates it with some default content.

The welcome file is displayed in the authentication page, and you can use it to provide some information about what your Hereditas box is, and how it can be used.

Note that the welcome file is **not encrypted**, so do not store any confidential information in there!

## Set the webhook URL

We need to set the URL of the webhook we created in the previous step. We can use [`hereditas webhook:set`]({{< relref "/cli/webhook_set.md" >}}) for that, replacing the URL below with yours:

````sh
hereditas webhook:set --url "https://maker.ifttt.com/trigger/hereditas_auth/with/key/123abc456def"
````

## Synchronize changes on Auth0

At this point, let's create the Hereditas application and rules on Auth0, which will also give us the required Client Id.

The Hereditas CLI has a built-in command [`hereditas auth0:sync`]({{< relref "/cli/auth0_sync.md" >}}) that manages the application, configuration and rules inside Auth0, in a fully-automated way. So, syncing the changes is as simple as running:

````sh
hereditas auth0:sync
````

The command above will create the application and the rules on Auth0, and make sure that everything is configured correctly. As we'll see in the next steps, you will need to re-run that command after making certain configuration changes.

## Next step: Build the static web app

We're finally ready to use the Hereditas CLI to build our static app! Follow the instructions in the next article for how:

<a class="hereditas-button" href="{{< relref "/guides/build-static-web-app.md" >}}">Build the static web app</a>


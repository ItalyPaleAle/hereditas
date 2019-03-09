---
title: Build the static web app
type: docs
---

# Build the static web app

Afterm gathering all the content you want to encrypt, setting up our "API Access" application on Auth0, and configuring a webhook endpoints to send notifications, we're ready to finally build the static web app.

## Initialize a working directory

Create a new empty folder on your laptop. Open a terminal inside that folder, then run:

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

After running the command, you'll see that your folder will contain three new objects:

````text
~/hereditas $ ls
content
dist
hereditas.json
````

- The `content` folder is where you can store the data you wish to encrypt
- The `dist` folder will contain the generated web app
- The `hereditas.json` file contains the configuration for the Hereditas box

> In most cases you will not need to manually edit the `hereditas.json` configuration file, as you can use the Hereditas CLI to change the most common options. However, you can find the full reference for the configuration file in the [Configuration file]({{< relref "/guides/configuration-file.md" >}}) article.

## Content

Place all the content you want to encrypt in the `content` folder. You can store any kind of file in this folder and sub-folders. The [Get started]({{< relref "/guides/get-started.md" >}}#step-zero-gather-all-content) article has some suggestions on what kind of content to store.

Markdown documents are automatically converted to HTML chunks, so that's a great way to include information. However, at the Hereditas web apps do not support hyperlinks, images or videos in Markdown or HTML files linking to other content within the box.

## Set the webhook URL

We need to set the URL of the webhook we created in the previous step. We can use [`hereditas webhook:set`]({{< relref "/cli/webhook_set.md" >}}) for that, replacing the URL below with yours:

````sh
hereditas webhook:set --url "https://maker.ifttt.com/trigger/hereditas_auth/with/key/123abc456def"
````

## Build the web app

You're finally ready to build the static web app, using the [`hereditas build`]({{< relref "/cli/build.md" >}}) command:

````sh
hereditas build
````

This will ask you to type the *user passphrase*, which needs to be at least 8 characters long. You can choose any passphrase you'd like, but a good practice is to use a bunch of words in your native language. If you're interested in the subject, check out [XKCD 936](https://www.explainxkcd.com/wiki/index.php/936:_Password_Strength).

Once the command is done, you'll see your generated files in the `dist` folder:

````text
~/hereditas $ ls content
hello.md
photo.webp
subfolder
text.txt
tulips.jpg

~/hereditas $ hereditas build
User passphrase: ***********
Finished building project in dist (took 3.895 seconds)

~/hereditas $ ls dist
14ec53f0e99728db2f471caf
15bc79f07f20c003532724bf
430c96dc23ccca5eb4227508
_index
d0160be2ee0f1479367b325c
d9f2eb6a0f34382c36d2a116
hereditas.1e03804dc40e456286e7.js
index.html
````

> The Hereditas CLI uses webpack behind the scenes to generate your static app. By default, the JavaScript code is bundled and minified. If you're looking at modifying the Hereditas source and want to skip the minification (for much faster builds) and include a sourcemap, you can call `NODE_ENV=development hereditas build` instead.

## Next step: Managing users

We're almost there. Before you can actually deploy your box (or test it locally), we need to configure the list of users who can unlock it.

<a class="hereditas-button" href="{{< relref "/guides/managing-users.md" >}}">Managing users</a>

---
title: Build the static web app
type: docs
---

# Build the static web app

In the previous step we created an Hereditas box, and now we're finally ready to build the static web app.

## Build the web app

You're finally ready to build the static web app, using the [`hereditas build`]({{< relref "/cli/build.md" >}}) command:

````sh
hereditas build
````

This will ask you to **type the _user passphrase_**, which needs to be at least 8 characters long. You can choose any passphrase you'd like, but a good practice is to use a bunch of words in your native language. If you're interested in the subject, check out [XKCD 936](https://www.explainxkcd.com/wiki/index.php/936:_Password_Strength).

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
hereditas.1e03804dc40e456286e7.css
hereditas.1e03804dc40e456286e7.js
index.html
````

> The Hereditas CLI uses webpack behind the scenes to generate your static app. By default, the JavaScript code is bundled and minified. If you're looking at modifying the Hereditas source and want to skip the minification (for much faster builds) and include a sourcemap, you can call `NODE_ENV=development hereditas build` instead.

## Next step: Managing users

We're almost there. Before you can actually deploy your box (or test it locally), we need to configure the list of users who can unlock it.

<a class="hereditas-button" href="{{< relref "/guides/managing-users.md" >}}">Managing users</a>

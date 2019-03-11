---
title: Get started
type: docs
---

# Get started

## Prerequisites

In order to use Hereditas, you will need [Node.js](https://nodejs.org/en/download/) 10 or higher installed on your laptop.

You will also need three services; we'll guide you through the creation of those in the next steps.

1. A (free) [Auth0](https://auth0.com/) account. This is used by Hereditas to ensure that only authorized users can access your data, and only after a certain amount of time after the first request. (But don't worry: Auth0 and their developers have no way to access your data)
2. A webhook that you can use to send you notifications when users log into your Hereditas box, so you know when the unlock timer starts and it gives you a chance to stop it. There are multiple options for that, including [IFTTT](https://ifttt.com/) (free), or more advanced solutions like Microsoft Flow, Azure Functions, AWS Lambda, etc.
3. A place where to host static HTML5 apps (HTML, JavaScript, CSS files, plus your encrypted content) serving it over HTTP(S).

## Install the Hereditas CLI

You can install the Hereditas CLI on your machine from NPM, by running:

````sh
npm install --global hereditas

# Verify it's installed with
hereditas --version
````

> Note: If you prefer not to install the CLI as a global package, you can always invoke it using NPX, for example with `npx hereditas --version`. However, each command invocation will take significantly longer as NPX needs to restore all dependencies.

## Step zero: gather all content

This is the least technical of all the steps, but by far the most important one.

As the owner of an Hereditas box, you start by assembling all the content you want to include in your digital legacy box. For example, text/Markdown documents, images, and other files.

Things you might want to include:

* The passwords to access your laptop and your phone/tablet/watch/etc.
* The recovery key for your password manager, for example iCloud Keychain, 1Password, LastPass, KeePass, etc.
* How to access your private photos on an encrypted drive or cloud storage.
* Useful encryption keys, inclduing keys for your cryptocurrency wallets.
* Or, just a nice letter.

This step is very personal, and Hereditas gives you total flexibility to decide what to include in your box.

While it would technically be possible, we recommend that you don't store large amount of data, or data that chages frequently, inside an Hereditas box. In fact, every time you change any information, you'd have to re-encrypt and publish again the entire box, which can be very time-consuming, and could lead to your box containing outdated information.

For example, rather than including gigabytes of photos, we recommend that you store them in a safe place (encrypted drive, cloud storage, etc) and use your Hereditas box to explain how to retrieve them. Similarly, instead of including every single password (which can change frequently), just put the recovery key of your password manager.

## Next step: Auth0 setup

After you've installed the Hereditas CLI and gathered all the content, you're ready to go to the next step and configure a new Auth0 account.

<a class="hereditas-button" href="{{< relref "/guides/auth0-setup.md" >}}">Auth0 setup</a>

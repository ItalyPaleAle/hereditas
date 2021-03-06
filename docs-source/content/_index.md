---
title: What is Hereditas
type: docs
---

![Hereditas logo](/images/hereditas-logo.png)

# What is Hereditas

**What happens to your digital life after you're gone?**

Hereditas, which means *inheritance* in Latin, is a static website generator that builds **fully-trustless digital legacy boxes**, where you can store information for your relatives to access in case of your sudden death or disappearance.

For example, you could use this to pass information such as passwords, cryptographic keys, cryptocurrency wallets, sensitive documents, etc.

{{< youtube lZEKgB5dzQ4 >}}

> Note: the video above was recorded with Hereditas 0.1. The design of the interface has been improved and made nicer in 0.2.

## Why we built Hereditas

Check out the announcement [**blog post**](https://withblue.ink/2019/03/18/what-happens-to-your-digital-life-after-youre-gone-introducing-hereditas.html?utm_source=web&utm_campaign=hereditas-docs) to understand more about why we built Hereditas and why you need it too.

## Design

We've designed Hereditas with three principles in mind.

### Fully trustless – really

With Hereditas, you don't need to trust any person or provider. **No other person or company has standing access to your data.**

As the owner of an Hereditas box, you can nominate some authorized users by whitelisting their email address and giving them a *user passphrase*.

To prevent authorized users from having standing access to your data, however, once they log into your Hereditas box for the first time, they need to wait for a few hours or days before they can unlock the box. This gives you, the owner of the box, enough time to stop the timer, by simply logging into the same Hereditas box.

For example, if you set the waiting time to 24 hours (the default), when a relative of yours tries to log in the timer starts and Hereditas sends you a notification right away. If you've not disappeared, you can log into the same Hereditas box within 24 hours and stop the timer. Without any action from you, after the delay has passed all your relatives would be able to unlock your Hereditas box by logging in again and typing the *user passphrase*.

Hereditas generates digital legacy boxes that are encrypted bundles within static HTML5 applications. The encryption key is split between what you give your users and what's stored inside the authorization provider, so no company or provider has standing access to your data.

### Simple for your loved ones

We designed Hereditas so it's simple to use for your loved ones, when they need to access your digital legacy box, even if they are not tech wizards. **A web browser is all they need.**

As the owner of the Hereditas box, you will provide them with the URL where they can find your box, and the *user passphrase* they need to use to unlock it. You will also whitelist their email address so they can log in with their existing accounts (e.g. Google, Facebook, Microsoft…) – no need to create new accounts for them and have new passwords around.

### No costly and/or time-consuming maintenance

You don't want to rely on a solution that you'll have to keep paying and/or patching for the rest of your life (and in this case, we mean that literally).

**Hereditas outputs a static HTML5 app that you can host anywhere you'd like**, for free or almost.

## Open source

We made Hereditas fully open source so you can study how the app works down to every detail. We wrote the app in JavaScript, and we use Node.js for the CLI and HTML5 for the static web app. **The source code is available on GitHub at [ItalyPaleAle/hereditas](https://github.com/ItalyPaleAle/hereditas)** under GNU General Public License (GPL) version 3.0 (see [LICENSE](https://github.com/ItalyPaleAle/hereditas/tree/master/LICENSE.md)).

We happily accept contributions! Feel free to submit a Pull Request to fix bugs or add new features. Equally important, you can contribute by improving this [documentation](https://github.com/ItalyPaleAle/hereditas/tree/master/docs-source) you're reading.

If you believe you've found a security issue that could impact other people, please [report it confidentially](https://www.npmjs.com/advisories/report?package=hereditas).

## Get started

Ready? Get started with Hereditas now!

<a class="hereditas-button" href="{{< relref "/introduction/quickstart-video.md" >}}">Quickstart Video</a>

Or:

<a class="hereditas-button" href="{{< relref "/guides/get-started.md" >}}">Get started documentation</a>

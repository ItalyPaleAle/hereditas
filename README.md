# Hereditas



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/hereditas.svg)](https://npmjs.org/package/hereditas)
[![Downloads/week](https://img.shields.io/npm/dw/hereditas.svg)](https://npmjs.org/package/hereditas)
[![License](https://img.shields.io/npm/l/hereditas.svg)](https://github.com/ItalyPaleAle/hereditas/blob/master/package.json)

Hereditas, which means *inheritance* in Latin, is a static website generator that builds "digital legacy boxes", where you can store information (passwords, cryptographic secrets for files and cryptocurrencies, sensitive documents) for your relatives to access in case you die or disappear.

<!-- toc -->
* [Hereditas](#hereditas)
* [Warning: alpha quality software](#warning-alpha-quality-software)
* [Why Hereditas?](#why-hereditas)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Warning: alpha quality software

**Hereditas is currently alpha quality software; use at your own risk.** While we've developed Hereditas with security always as the top priority, this software leverages a lot of cryptographic primitives that are hard to use right. We won't release a stable (e.g. "1.0") version of Hereditas until we're confident that enough people and cryptography experts have audited and improved the code.

**Your help is highly appreciated.** If you are an expert on security or cryptography, please help us reviewing the code and let us know what you think - including if everything looks fine, or if you found a bug.

TODO: Email address for confidential communication.

# Why Hereditas?

> Note: in this section we're writing about life, death and relationships in a very pragmatic way (in short, in the way a software developer would).

What happens after you die or suddenly disappear? All countries, cultures and religions have laws or customs for dealing with your legacy, including your physical inheritance (your wealth) as well as your moral one. However, there's a new kind of legacy we're totally not prepared for: our digital one. As we rely more and more on technology and the Internet, we are also protecting our digital assets with passcodes, passwords or biometrics like fingerprints, which are challenging to pass along.

How will your partners, children, or other loved people, get access to your digital life when your die? How will they get to access your photos on the cloud, your assets invested in cryptocurrencies, or your online profiles?

Some persons decide to share their passwords with their significant others, like husbands or wives. Security experts would argue that this is a potentially insecure behavior, as the more people knowing your passwords (or having them stored somewhere), the more likely it is that they could get stolen. When people share passwords, then, they're harder to change, and it is more challenging to use Multi-Factor Authentication.

There are ways to mitigate these risks (e.g. sharing a password manager), but they're not risk-free either. For example, your relationship might end, abrutedly and in a non-friendly way, and your (ex) partner who has access to your passwords could damage you, your reputation and your finances significantly. Even if you have full trust in your significant other and you believe that your relationship will never end, you need to realize that a single other person having access to your life is still not enough redudancy; and adding a third person or more would just amplify the security risks even further.

Hereditas is not the first solution that tries to solve the problem of your digital legacy with code. However, we believe Hereditas' innovation is in the fact that it doesn't require you to trust another person or provider, and that once you set it up, it will require virtually no investment of money or time to keep running.

## How is Hereditas different?

Hereditas is a static website generator, that takes text you write (including Markdown) and other files, encrypts them in a safe way and outputs a static HTML5 app that you can serve from anywhere.

Hereditas is different from other solutions thanks to the following design qualities:

* **Trustless**: With Hereditas, you don't need to trust any person or provider with having standing access to your data.
* **Simple:** We designed Hereditas so it's simple to use for your loved ones, when they need to access your digital legacy box. A web browser is all they need.
* **No expensive and/or time-consuming maintenance:** You don't want to rely on a solution that you'll have to pay for and/or patch for literally the rest of your life. Hereditas outputs a static HTML5 that you can host anywhere you'd like, often for free, or almost. For example, you could leverage an object storage service like AWS S3, Azure Blob Storage, or Google Cloud Storage; or, you can use any other solution you'd like, as long as it can serve pages over HTTP(S).

## How does it work? (Quickstart)

### First: collect all the content

As the Owner of an Hereditas box, you start by assembling all the content you want to encrypt. This can include text/Markdown files, images, documents, etc.

Things you might want to include:

* The password to access your laptop and your phone/tablet/watch/etc.
* The recovery key for your password manager, for example iCloud Keychain, 1Password, LastPass, KeePass, etc.
* How to access your photos on an encryopted drive or cloud storage.
* Useful encryption keys, inclduing keys for your cryptocurrency wallets.
* Or, just a nice letter.

This step is very personal, and Hereditas gives you total flexibility to decide what to include in your box.

While it would technically work, we recommend that you don't store large amount of data, or data that chages frequently, inside an Hereditas box. In fact, every time you change any information, you'd have to re-encrypt and publish the entire box, which can be very time-consuming. For example, rather than including gigabytes of photos, store them in a safe place (encrypted drive, cloud storage, etc) and explain how to retrieve them. Or, instead of including every single password, just put the recovery key of your password manager.

### Second: build and publish the static website

After you've collected your data, generate the static website using the Hereditas CLI.

TODO: Quickstart commands here

Publish them anywhere you'd like. We recommend to leverage an external service, such as an object storage service (AWS S3, Azure Blob Storage, Google Cloud Storage) or another provider that can host and serve static websites. If you feel fancy, you could even pin them on IPFS.

Our recommendation is to consider using services that are free (otherwise, what happens if your relatives cancel your credit card paying for the service after you die?) and that are off-premises. For example, if you were to store files on your server at home, your not-techie relatives might not be able to access (or even rebuild, if necessary) your network. Storing your data on more than one provider might not be a bad idea either, for redundancy.

All files are encrypted using industry-standard AES-256, so your date is safe even if it's stored in a public place.

Hereditas relies on some external services that are necessary for it to work. You'll need an Auth0 account, as well as an IFTTT one. Both are free to use, and neither of them is given access to your data.

### Third: tell your loved ones how to access your Hereditas box

After you've built and published your Hereditas box, prepare a document telling your loved ones how they can access it when they need it. This document should contain both and only the passphrase and the URL(s) of the static app.

You can email this information to them, or print it somewhere, or both.

The passphrase alone isn't enough to decrypt your Hereditas box, so

## What happens after you disappear?

In case of your death or disappearance, your loved ones can visit the URL of your Hereditas box and log in (through Auth0) using one of their social accounts you've whitelisted before (e.g. their Google or Facebook accounts).

At that point, a timer is started. As the Owner of the Hereditas box, you'll receive a notification (via IFTTT - could be a text message, an email, phone call...). You have a certain amount of time (e.g. 24 hours) to log into the same app using your "Owner account".

If the Owner doesn't log in, after the time interval is over your Hereditas box becomes "unlocked", and your loved ones will have full access to the data inside it.

## How does Hereditas protect your data?

We've designed Hereditas so that the data is fully encrypted and no person or provider (besides you) has standing access to it.

* Your data is encrypted with a key consisting of two parts: a user passphrase that you give to your loved ones, and a "token" stored inside Auth0.
* An encryption key is then derived by concatenating the passphrase (which is in your loved ones' hands) and the token (which is inside Auth0), and then use a key derivation function like PBKDF2 or Argon2 (configurable at compile time).
* Your loved ones aren't able to decrypt your data just by using the passphrase you provide them. Likewise, Auth0 can't decrypt your data with the token alone, and they never see the user passphrase.
* Auth0 is used to maintain a "timer". When someone who is not an Owner logs into the static app, a timer is started. The Owner receives a notification, which is triggered by a Webhook to IFTTT, and has a certain amount of time (e.g. 24 hours) to log in and stop the timer.
* You should set the interval before your data is unlocked considering the longest time you could be without access to your phone (where you get the log in notifications) and the Internet (to log into your app).
* After the interval is over without the Owner stopping the timer, Auth0 will start including the token in the claims when your users authenticate with your app. With the passphrase typed by the user inside the app (which is never transmitted anywhere), the Hereditas box can be unlocked.

# Usage

<!-- usage -->
```sh-session
$ npm install -g hereditas
$ hereditas COMMAND
running command...
$ hereditas (-v|--version|version)
hereditas/0.1.0 darwin-x64 node-v10.15.0
$ hereditas --help [COMMAND]
USAGE
  $ hereditas COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`hereditas build`](#hereditas-build)
* [`hereditas help [COMMAND]`](#hereditas-help-command)
* [`hereditas init`](#hereditas-init)

## `hereditas build`

Builds an Hereditas project

```
USAGE
  $ hereditas build
```

_See code: [cli/commands/build.js](https://github.com/ItalyPaleAle/hereditas/blob/v0.1.0/cli/commands/build.js)_

## `hereditas help [COMMAND]`

display help for hereditas

```
USAGE
  $ hereditas help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `hereditas init`

Initializes a new Hereditas project

```
USAGE
  $ hereditas init

OPTIONS
  -c, --auth0ClientId=auth0ClientId          (required) Auth0 client ID for the management app
  -d, --auth0Domain=auth0Domain              (required) Auth0 domain/tenant (e.g. "myhereditas.auth0.com")
  -i, --content=content                      [default: content] Path of the directory with content
  -o, --dist=dist                            [default: dist] Path of the dist directory (where output is saved)
  -s, --auth0ClientSecret=auth0ClientSecret  (required) Auth0 client secret for the management app
```

_See code: [cli/commands/init.js](https://github.com/ItalyPaleAle/hereditas/blob/v0.1.0/cli/commands/init.js)_
<!-- commandsstop -->

# Hereditas

[![Version](https://img.shields.io/npm/v/hereditas.svg)](https://npmjs.org/package/hereditas)
[![Downloads/week](https://img.shields.io/npm/dw/hereditas.svg)](https://npmjs.org/package/hereditas)
[![License](https://img.shields.io/npm/l/hereditas.svg)](https://github.com/ItalyPaleAle/hereditas/blob/master/package.json)

Hereditas, which means *inheritance* in Latin, is a static website generator that builds fully-trustless "digital legacy boxes", where you can store information for your relatives to access in case of your sudden disappearance. For example, you could use this to pass information such as passwords, cryptographic keys, cryptocurrency wallets, sensitive documents, etc.

## Warning: alpha quality software

**Hereditas is currently alpha quality software; use at your own risk.** While we've developed Hereditas with security always as the top priority, this software leverages a lot of cryptographic primitives under the hood. We won't release a stable (e.g. "1.0") version of Hereditas until we're confident that enough people and cryptography experts have audited and improved the code.

**Your help is highly appreciated.** If you are an expert on security or cryptography, please help us reviewing the code and let us know what you think - including if everything looks fine, or if you found a bug.

Responsible disclosure: if you believe you've found a security issue that could compromise current users of Hereditas, please send a confidential email to `security` [at] `hereditas` [dot] `app`.

## About Hereditas

Hereditas is a static website generator, that takes text you write (including Markdown), images and other files, then encrypts them in a safe way and outputs a static HTML5 app that you can serve from anywhere.

### Design

We've designed Hereditas with three principles in mind:

* **Trustless**: With Hereditas, you don't need to trust any person or provider. No other person or company has standing access to your data. If a person wants access to your data, they first need to be authorized by you (by whitelisting their email address and giving them the "passphrase"). Additionally, after requesting access to your data, you are given a certain amount of time (e.g. one day or more) before they can unlock the box.
* **Simple to browse:** We designed Hereditas so it's simple to use for your loved ones, when they need to access your digital legacy box, even if they are not tech wizards. A web browser is all they need.
* **No expensive and/or time-consuming maintenance:** You don't want to rely on a solution that you'll have to keep paying and/or patching for the rest of your life (literally). Hereditas outputs a static HTML5 that you can host anywhere you'd like, often for free, or almost.

### Requirements

Hereditas is a static site generator. In order for its full functionality to work, you will need just three things:

1. A place where to host static HTML5 apps (HTML, JavaScript, CSS files, plus your encrypted content) serving it over HTTP(S).
    * Since all of your data is encrypted, Hereditas boxes are designed to be deployed on publicly-accessible endpoints, safely.
    * This could be an object storage service like [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html) or [Azure Blob Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website); or, you can use any other solution you'd like, as long as it can serve pages over HTTP(S).
    * While possible, we do not recommend deploying Hereditas on a cloud server or VPS (*what would happen if your credit card got canceled?*), nor inside a server in your home (*would your relatives know how to easily access it from within your LAN?*). Ultimately, however, it's up to you, and to the trust you put in the technical skills of your loved ones.
2. A (free) [Auth0](https://auth0.com/) account. This is used by Hereditas to ensure that only authorized users can access your data, and only after a certain amount of time after the first request.
3. An [IFTTT](https://ifttt.com/) account (free). This is optional, but highly recommended. This is used to notify you when users log into your Hereditas box, so you know when the unlock timer starts and gives you a chance to stop it.

### Security model

1. Hereditas (the static site generator) encrypts all your sensitive data with AES-256-GCM, a symmetric cryptography algorithm that is industry-standard for encrypting data.
2. The data is encrypted using a key derived from the *user passphrase* and the *application token*, two strings that are concatenated together.
    * The *user passphrase* needs to be manually typed by the owner when encrypting the data, and by the users before the can unlock the box on the Hereditas app. The owner can choose any passphrase they want, as long as it's longer than 8 characters.
    * The *application token* is unique to each Hereditas box and stored in the `hereditas.json` configuration file. By default, Hereditas generates it when the `hereditas init` command is executed (and can be re-generated with `hereditas regenerate-token`), by getting 21 random bytes with Node.js' [`crypto.randomBytes()`](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback) then encoding it as base64. The application token is then stored inside Auth0 as a ["rule setting"](https://auth0.com/docs/rules/guides/configuration), and it's returned in the JWT token only when appropriate (see below).
3. The cryptographic key is derived from the concatenated string with [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2), which is a key derivation function based on SHA-512 that is more resistant to brute-force attacks. It uses a number of iterations that can be set in the `hereditas.json` config file, with a default of 100,000. Additionally, it uses a salt that is re-generated on each new build of Hereditas (each time you run `hereditas build`) and then stored unencrypted inside the app's JavaScript files.
4. When users open the generated app, they are redirected to Auth0 to authenticate themselves.
    * Only users whose email address is explicitly whitelisted (using `hereditas user:add`) are allowed to log in. Users can authenticate with any social profile they want (e.g. Google or Facebook accounts), as long as the email address matches.
    * Users can have two roles: *owner* and *user*.
    * When an *owner* authenticates, Auth0 includes the *application token* in the JWT token every time. Thus, owners who also know the *user passphrase* can unlock their Hereditas boxes any time they want.
    * When a normal (ie. non-owner) user authenticates the first time, Auth0 sets the time of the login in the Client Application setting, but does not return the *application token*.
    * After a configurable amount of time, e.g. 24 hours, users can authenticate again, and Auth0 will include the *application token* in the JWT token. At this point, users can unlock the Hereditas box if they also know the *user passphrase*.
    * If an *owner* authenticates, Auth0 resets any active timer, preventing users to unlock the Hereditas box when the owner is still around.

The model above is what allows Hereditas to be fully trustless:

1. Users, who are in possession of the *user passphrase*, cannot unlock Hereditas boxes without the *application token*.
2. Auth0 stores only the *application token* and has no knowledge of the *user passphrase*. So, a malicious actor who could extract the *application token* from Auth0 would not be able to unlock the Hereditas box.
3. Users need to wait a certain amount of time before they're allowed to unlock Hereditas boxes, and their owners can stop the timer by logging in themselves. This guarantees that ill-intentioned users won't be able to unlock Hereditas boxes.

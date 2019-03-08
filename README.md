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

## License

Copyright © 2019, Alessandro Segala @ItalyPaleAle

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You can read the full text of the license in the [LICENSE.md](./LICENSE.md) file.

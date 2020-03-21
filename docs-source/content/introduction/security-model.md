---
title: Security model
type: docs
---

# Security model

This document explains in technical details how Hereditas ensures that your data is protected.

## Data encryption

Hereditas, as a static site generator, encrypts all of your sensitive data with AES-256 in [Galois/Counter Mode (CGM)](https://en.wikipedia.org/wiki/Galois/Counter_Mode), a symmetric cryptographic algorithm that is industry-standard for encrypting data. GCM is an authenticated encryption algorithm, designed to provide both data authenticity and confidentiality.

Each file is encrypted with a unique, random 256-bit key (32 bytes), which is wrapped with a master key (read more below). The wrapped key (40 bytes-long after wrapping) is stored at the beginning of the file.

Additionally, each file is encrypted with a unique, random IV of 12 bytes, which is stored in clear text at the beginning of each file, right after the wrapped key.

Encrypted files are given random names so attackers cannot gather information about the name and type of each file.

## Index file

Each Hereditas box also contains an `_index` file, which is encrypted just like each data file. The file's key is 256-bit, unique and randomly-generated, and it's wrapped with the master key. The wrapped key and the random, unique 12-byte IV are stored at the beginning of the file.

When in cleartext, the index file is a JSON document that contains the original file name, the id of the object stored in the Hereditas box, the authentication tag (as returned by AES-GCM), and a few more details. For more information on the index file, see the [Index file]({{< relref "/advanced/index-file.md" >}}) article in the advanced section.

## Master key

Each file inside the box is encrypted with a unique key that is wrapped with a master key. You can read the next section for details on the key wrapping algorithm used.

The master key is itself derived from the *user passphrase* and the *application token*.

The **user passphrase** is set while running [`hereditas build`]({{< relref "/cli/build.md" >}}). Users need to type it in the Hereditas app before they can unlock the box. The owner can choose any passphrase they want, as long as it's longer than 8 characters. This is not stored anywhere, but you should communicate it (in a safe way) to your loved ones.

The **application token** is unique to each Hereditas box and stored in the `hereditas.json` configuration file. By default, Hereditas generates it when the [`hereditas init`]({{< relref "/cli/init.md" >}}) command is executed, and the token can be re-generated with [`hereditas regenerate-token`]({{< relref "/cli/regenerate-token.md" >}}). The CLI creates the application token by getting 21 random bytes with Node.js [`crypto.randomBytes()`](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback), then encoding them as base64. The application token is stored inside Auth0 as a ["rule configuration"](https://auth0.com/docs/rules/guides/configuration), and it's passed to the web app in the JWT token for users that are logged in when they're ready to unlock the box (see below).

The **master key** is derived from the concatenated string (user passphrase + application token) using a key derivation function. Hereditas supports two strong, industry-standard key derivation functions:

- [Argon2](https://en.wikipedia.org/wiki/Argon2) is the default since version 0.2, and it uses the Argon2id variant. Argon2id can use a configurable amount of memory, which can be set in the `hereditas.json` config file; the default is 64 MB.
- [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2), which is based on SHA-512 and supports a configurable number of iterations. The default is 100,000 iterations, and it can be configured with the `hereditas.json` config file.

Both key derivation functions generate a 256-bit key.

Argon2 is the default because it is known to provide better resistance against GPU-based brute force attacks. However, while support for PBKDF2 is available natively in browser thanks to the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), Argon2 uses an [external module](https://github.com/antelle/argon2-browser) based on WebAssembly.

Hereditas uses a salt with the key derivation function (both Argon2 and PBKDF2) that is re-generated on each new build of the box (ie. each time you run [`hereditas build`]({{< relref "/cli/build.md" >}})), and it's stored inside the app's JavaScript file in cleartext.

## Key wrapping

After deriving the master key, Hereditas can use that to wrap and un-wrap the key used to encrypt each file.

As mentioned above, each file's key is a unique, randomly-generated sequence of 32 bytes (256 bits), suitable for AES-256-GCM. This key is wrapped and then stored at the beginning of each file.

File keys are wrapped using the AES-KW algorithm, as defined in RFC 3394. The master key is used as wrapping key.

## Unlocking the box

In order to unlock the box, users need to complete two steps:

1. Authenticate with Auth0. This lets authorized users get the *application token* if appropriate.
2. Type the *user passphrase*.

When users open the Hereditas web app, they are redirected to Auth0 to authenticate themselves.

- Only users whose email address is explicitly whitelisted (using [`hereditas user:add`]({{< relref "/cli/user_add.md" >}})) are allowed to log in. Users can authenticate with any social profile they want (anything supported by Auth0, eg. Google, Facebook, Microsoft accounts, etc), as long as the email address returned by the provider is included in the whitelist.
- Users can have two roles: *owner* and *user*.
- When an **owner** authenticates, Auth0 includes the *application token* in the JWT token every time. Owners who also know the *user passphrase* can unlock their Hereditas boxes any time they want.
- When a normal **user** (ie. non-owner) authenticates the first time, Auth0 sets the time of the login in the Client Application setting, but does not return the *application token*.
- After a configurable amount of time, e.g. 24 hours, users (non-owners) can authenticate again, and this time Auth0 will include the *application token* in the JWT token. The wait time can be configured with [`hereditas wait-time:set`]({{< relref "/cli/wait-time_set.md" >}}). Users can then unlock the Hereditas box if they also know the *user passphrase*.
- If an *owner* authenticates at any time, Auth0 resets any active timer, preventing other users to unlock the Hereditas box when the owner is still around.

## Trustless

The model above is what allows Hereditas to be fully trustless:

1. Users who are in possession of the *user passphrase* cannot unlock Hereditas boxes without the *application token*, even if they have full access to the encrypted files.
2. Auth0 stores only the *application token* and has no knowledge of the *user passphrase*. So, a malicious actor who managed to extract the *application token* from Auth0 would not be able to unlock the Hereditas box.
3. Users need to wait a certain amount of time before they're allowed to unlock Hereditas boxes, and owners can stop the timer by logging in themselves. This guarantees that ill-intentioned users won't be able to unlock Hereditas boxes until you're around.

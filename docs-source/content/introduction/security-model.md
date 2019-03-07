---
title: Security model
type: docs
---

# Security model

This documents explains in technical details how Hereditas ensures that your data is protected.

## Data encryption

Hereditas, as a static site generator, encrypts all of your sensitive data with AES-256 in [Galois/Counter Mode (CGM)](https://en.wikipedia.org/wiki/Galois/Counter_Mode), a symmetric cryptographic algorithm that is industry-standard for encrypting data. It's an authenticated encryption algorithm, designed to provide both data authenticity and confidentiality.

Each file is encrypted with a unique IV of 12-bytes, which is stored in clear text at the beginning of each file.

Encrypted files are given random names so attackers cannot gather information about the name and type of each file.

## Index file

Each Hereditas box also contains an `_index` file, which is encrypted using the same key as the data, and a unique 12-bytes IV stored at the beginning of the file.

When in cleartext, the index file is a JSON document that contains the original file name, the file name under which the object is stored in the Hereditas box, the authentication tag (as returned by AES-GCM), and a few more details. For more information on the index file, see the [Index file]({{< relref "/advanced/index-file.md" >}}) article in the advanced section.

## Encryption key

The data is encrypted using a key derived from the *user passphrase* and the *application token*, two strings that are concatenated together.

The **user passphrase** is set while running [`hereditas build`]({{< relref "/cli/build.md" >}}). Users need to type it in the Hereditas app before the can unlock the box. The owner can choose any passphrase they want, as long as it's longer than 8 characters.

The **application token** is unique to each Hereditas box and stored in the `hereditas.json` configuration file. By default, Hereditas generates it when the [`hereditas init`]({{< relref "/cli/init.md" >}}) command is executed, and can be re-generated with [`hereditas regenerate-token`]({{< relref "/cli/regenerate-token.md" >}}). The CLI creates it by getting 21 random bytes with Node.js [`crypto.randomBytes()`](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback), then encoding it as base64. The application token is then stored inside Auth0 as a ["rule setting"](https://auth0.com/docs/rules/guides/configuration), and it's passed to the web app in the JWT token for users that are logged in once they're ready to unlock the box (see below).

The **cryptographic key** is derived from the concatenated string (user passphrase + application token) using [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2), which is a key derivation function based on SHA-512 that is more resistant to brute-force attacks. Hereditas uses a number of iterations for PBKDF2 that can be set in the `hereditas.json` config file, with a default of 100,000. Additionally, it uses a salt that is re-generated on each new build of the box (ie. each time you run [`hereditas build`]({{< relref "/cli/build.md" >}})) and then stored inside the app's JavaScript files in cleartext.

## Unlocking the box

In order to unlock the box, users need to complete two steps:

1. Authenticate with Auth0. This lets uauthorized users get the *application token* if appropriate.
2. Type the *user passphrase*.

When users open the Hereditas web app, they are redirected to Auth0 to authenticate themselves.

- Only users whose email address is explicitly whitelisted (using [`hereditas user:add`]({{< relref "/cli/user_add.md" >}})) are allowed to log in. Users can authenticate with any social profile they want (anything supported by Auth0, eg. Google, Facebook or Microsoft accounts), as long as the email address matches.
- Users can have two roles: *owner* and *user*.
- When an **owner** authenticates, Auth0 includes the *application token* in the JWT token every time. Owners who also know the *user passphrase* can unlock their Hereditas boxes any time they want.
- When a normal **user** (ie. non-owner) authenticates the first time, Auth0 sets the time of the login in the Client Application setting, but does not return the *application token*.
- After a configurable amount of time, e.g. 24 hours, users can authenticate again, and this time Auth0 will include the *application token* in the JWT token. The wait time can be configured with [`hereditas wait-time:set`]({{< relref "/cli/wait-time_set.md" >}}). Users can then unlock the Hereditas box if they also know the *user passphrase*.
- If an *owner* authenticates at any time, Auth0 resets any active timer, preventing users to unlock the Hereditas box when the owner is still around.

## Trustless

The model above is what allows Hereditas to be fully trustless:

1. Users, who are in possession of the *user passphrase*, cannot unlock Hereditas boxes without the *application token*.
2. Similarly, even if users have access to the encrypted files, having the *user passphrase* alone isn't sufficient to decrypt them.
3. Auth0 stores only the *application token* and has no knowledge of the *user passphrase*. So, a malicious actor who managed to extract the *application token* from Auth0 would not be able to unlock the Hereditas box.
4. Users need to wait a certain amount of time before they're allowed to unlock Hereditas boxes, and owners can stop the timer by logging in themselves. This guarantees that ill-intentioned users won't be able to unlock Hereditas boxes.

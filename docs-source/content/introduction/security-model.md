---
title: Security model
type: docs
---

# Security model



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
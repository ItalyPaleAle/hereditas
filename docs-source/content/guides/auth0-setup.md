---
title: Auth0 setup
type: docs
---

# Auth0 setup

[Auth0](https://auth0.com/) is an authentication provider built to be flexible, safe and reliable. It offers a generous free tier that is more than enough for any user of Hereditas.

On Auth0, users can authenticate using their existing social logins, including Google, Facebook, Microsoft Accounts, Twitter, etc. This is very convenient because it lets your users sign in with existing credentials, so you don't need to create new accounts (and passwords) for them. It also offers increased security, as providers like Microsoft, Google, Facebook (and Auth0 itself) have a powerful infrastructure to prevent and detect malicious logins (often using AI on millions of authentications by their users every day), and they support Multi-Factor Authentication.

> **Why do we need Auth0?**
>
> Hereditas is a static website generator. In order to reduce the need for future maintenance and keeping operating costs to zero (or almost), Hereditas outputs a static HTML5 web app with no server-side at all. Web apps nowadays are extremely powerful and we are able to do advanced cryptographic operations within a web browser.
>
> However, in order to implement the wait timer (ensuring that users need to wait a certain amount of time after their first login to unlock your box), we needed to store data in a centralized repository. Using Auth0 and splitting the encryption key between the *user passphrase* given to your users, and the *application token* stored inside the authentication provider, lets us precisely do that, while still maintaining the promise of a fully-trustless platform. For more information, check out the [Security model]({{< relref "/introduction/security-model.md" >}}) article.

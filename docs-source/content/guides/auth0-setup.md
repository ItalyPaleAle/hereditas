---
title: Auth0 setup
type: docs
---

# Auth0 setup

[Auth0](https://auth0.com/) is an authentication provider built to be flexible, safe and reliable. It offers a generous free tier that is more than enough for any user of Hereditas.

On Auth0, users can authenticate using their existing social logins, including Google, Facebook, Microsoft Accounts, Twitter, etc; the list of supported providers is [fairly long](https://auth0.com/docs/identityproviders). This is very convenient because it lets your users sign in with existing credentials, so you don't need to create new accounts (and passwords) for them. It also offers increased security, as providers like Microsoft, Google, Facebook (and Auth0 itself) have a powerful infrastructure to prevent and detect malicious logins (often using AI trained on millions of authentications by their users every day), and they support Multi-Factor Authentication.

> **Why do we need Auth0?**
>
> Hereditas is a static website generator. In order to reduce the need for future maintenance and keeping operating costs to zero (or almost), Hereditas outputs a static HTML5 web app with no server-side at all. Web apps nowadays are extremely powerful and we are able to do advanced cryptographic operations within a web browser.
>
> However, in order to implement the wait timer (ensuring that users need to wait a certain amount of time after their first login to unlock your box), we needed to store data in a centralized repository. Using Auth0 and splitting the encryption key between the *user passphrase* given to your users, and the *application token* stored inside the authentication provider, lets us precisely do that, while still maintaining the promise of a fully-trustless platform. For more information, check out the [Security model]({{< relref "/introduction/security-model.md" >}}) article.

## Sign up for Auth0

On the [Auth0 website](https://auth0.com/), sign up and create a new (free) account.

After creating an account, you should automatically be redirected to the [Auth0 management portal](https://manage.auth0.com/), where you can create a new domain. Choose a name (must be universally unique) and a region, then continue the walkthrough until you've created your account and domain.

![Auth0 management portal: new domain creation](/images/auth0-setup-create-domain.png)

## Create the "API Access" application

Once you are inside the Auth0 management portal, click on the button to create a new application.

Throughout this documentation, we'll name this new application "API Access", even though you can choose whichever name you prefer. Choose type "Machine to Machine App", then create the app.

![Auth0 management portal: create a new Machine to Machine application](/images/auth0-setup-create-application.png)

In the next step, you need to grant this application access to the Auth0 APIs. From the dropdown menu, select "Auth0 Management API". Then, select **all and only** the following scopes:

- read:clients
- update:clients
- create:clients
- read:rules
- update:rules
- delete:rules
- create:rules
- update:rules_configs

![Auth0 management portal: enable Auth0 Management APIs](/images/auth0-setup-create-application-api.png)

Lastly, from the Settings tab, take note of the following values, which we'll need to pass to the Hereditas CLI:

- Domain
- Client ID
- Client Secret

![Auth0 management portal: obtain credentials for API Access app](/images/auth0-setup-credentials.png)

## Next step: Login notifications

In the next step, we'll configure a webhook to send notifications when users sign into your Hereditas box.

<a class="hereditas-button" href="{{< relref "/guides/login-notifications.md" >}}">Login notifications</a>

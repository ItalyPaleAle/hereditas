---
title: Auth0 manual configuration
type: docs
---

# Auth0 manual configuration

Hereditas uses Auth0 to authenticate users and to provide the *application token*, which is part of the string used to derive the encryption key.

This document explains the configuration that the Hereditas CLI performs when you execute the [`hereditas auth0:sync`]({{< relref "/cli/auth0_sync.md" >}}) command.

> **Important:** this page is primarily primarily meant as reference. We recommend letting the Hereditas CLI manage the Auth0 configuration with the [`hereditas auth0:sync`]({{< relref "/cli/auth0_sync.md" >}}) command rather than changing settings manually.

## Differences with the API application

In the [Auth0 setup]({{< relref "/guides/auth0-setup.md" >}}) guide we guided you through the creation of an **API Access** app ("Machine to Machine") and how to get the credentials, which are used by the Hereditas CLI to configure Hereditas on Auth0, including setting up the rules, and also by the Hereditas rules on Auth0 to set timers.

This document focuses on the main "Hereditas" application on Auth0, which is what users will authenticate with.

## Hereditas application

On Auth0, create an application of type **Single Page Application**. You can name it any way you want, but `Hereditas` is probably a good name.

Once the app is created, take note of the **Domain** and the **Client ID**. We will not need the Client Secret.

### Application configuration

Ensure that the application is configured with:

- **Application type**: Should be "Single Page Application"
- **Allowed callback URLs**: List of URLs (one per line) where your box is deployed to
- **JWT Expiration**: Recommended to set it to a value that make sense for you, for example 1800 seconds (30 mins)

Under **Advanced Settings**, then **OAuth**:

- **JsonWebToken Signature Algorithm**: Should be "RS256"
- **OIDC Conformant**: Should be enabled.

### Application Metadata

The application needs to be configured with the following "Application Metadata" (called `client_metadata` in the Auth0 APIs):

- **`hereditas`**: this is required and must be set to `1`.
- **`requestTime`**: set this value to `0`. When users that are not owners sign in, rules update this value with the current time (as UNIX timestamp).
- **`waitTime`**: the amount of time, in seconds, to wait before Auth0 can return to users (non-owners) the app token. Set this value to whatever makes sense for you; `86400` (1 day) is often a good amount of time.

## Rules

The `auth0` folder in the repository contains the rules that need to be configured in Auth0. Note that the order below is very important!

- **Hereditas 01 - Whitelist email addresses (`01-whitelist.js`)**: This rule configures which users are allowed to authenticate, by whitelisting their email address.
- **Hereditas 02 - Notify (`02-notify.js`)**: This rule sends a notification on all successful logins via a webhook.
- **Hereditas 03 - Wait logic (`03-wait-logic.js`)**: This rule implements the "wait logic". If a non-owner users signs in, the rule starts the timer (by setting the current timestamp in the `waitTime` application metadata). After the wait is over, this same rule adds the app token to the claim. If an owner signs in, the timer is reset (and the app token is added to the claim regardless).

The scripts above contain some tokens that need to be replaced with the list of email addresses of all users or just owners.

- **`/*%OWNERS%*/`** This token needs to be replaced with the JSON-encoded array of all email addresses of users who are owners.
- **`/*%ALL_USERS%*/`** This token needs to be replaced with the JSON-encoded array of all email addresses of all users.

For example:

````js
const whitelist = /*%ALL_USERS%*/;
const owners = /*%OWNERS%*/;
// Become
const whitelist = ["me@example.com", "someone@example.com"];
const owners = ["me@example.com"];
````

In the rules page, add the following settings. You will need some credentials from the "API Access" app, which is the "Machine to Machine" app created in the getting started guide.

- **`APP_TOKEN`**: the application token part of the encryption key.
- **`AUTH0_CLIENT_ID`**: Set this to the Client ID of the API Access app.
- **`AUTH0_CLIENT_SECRET`**: Set this to the Client Secret of the API Access app.
- **`WEBHOOK_URL`**: URL of the webhook invoked when a new authentication is successful (see the [Login notifications]({{< relref "/guides/login-notifications.md" >}})).

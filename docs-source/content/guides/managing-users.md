---
title: Managing users
type: docs
---

# Managing users

You can use the Hereditas CLI to add or remove authorized users and owners.

## Roles

Hereditas users can have one of two roles:

- **user**: This is the normal user role. When someone with an *user* role signs into your Hereditas box, they do are not immediately able to unlock it. Instead, a successful authentication of someone with a *user* role will start the timer, and after the delay you configure (e.g. 24 hours), users can sign in again and this time they'll be able to unlock the box (as long as they know the *user passphrase*).
- **owner**: When an *owner* successfully signs in, two things happen. First, they are always returned the *application token* by Auth0, so they can unlock the Hereditas box at any time (as long as they know the *user passphrase*). Second, an *owner* logging in always stops any running timer, preventing normal people with an *user* role from accessing your data when you don't want them to.

## Add or remove authorized users

You can easily manage users with the Hereditas CLI.

To **add users**, use the [`hereditas user:add`]({{< relref "/cli/user_add.md" >}}) command.

````sh
hereditas user:add --email "someone@example.com"
````

By default, all users are given the role *user*. To add an *owner*, use the `--role owner` option:

````sh
hereditas user:add --email "owner@example.com" --role owner
````

You can **list users** who have access to your Hereditas box, and their roles, with the [`hereditas user:list`]({{< relref "/cli/user_list.md" >}}) command.

````sh
hereditas user:list
````

Lastly, you can **remove users** with the [`hereditas user:rm`]({{< relref "/cli/user_rm.md" >}}) command.

````sh
hereditas user:rm --email "someone@example.com"
````

## Synchronize changes on Auth0

The commands above save the changes in the local `hereditas.json` configuration file only.

In order for changes like adding/removing users (and others including changing the wait time, the webhook URL, or re-generating the application token) to be effective, you need to synchronize them with Auth0.

We can use again the [`hereditas auth0:sync`]({{< relref "/cli/auth0_sync.md" >}}) command, which will synchronize all changes in Auth0, updating our rules and application configuration, in a fully-automated way.

````sh
hereditas auth0:sync
````

## Next step: Deploy the box

We're almost there! Ready to test the box locally and then deploy it, so your users can access it when needed.

<a class="hereditas-button" href="{{< relref "/guides/deploy-box.md" >}}">Deploy the box</a>

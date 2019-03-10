---
title: Login notifications
type: docs
---

# Login notifications

As the owner of an Hereditas box, you'll want to be notified when someone signs into your box, to potentially block unauthorized attempts. For example, you can choose to receive a text message, or an email, etc.

Hereditas uses [webhooks](https://codeburst.io/what-are-webhooks-b04ec2bf9ca2) for this, which are just POST requests to an external HTTPS endpoint (make sure you use HTTPS, and not HTTP!).

## Notification webhook

Hereditas sends a webhook to the URL you provide, as a POST request with the following JSON body:

````json
{
    "value1": "Full notification, e.g. 'New Hereditas login on Fri, 08 Mar 2019 12:01:10 GMT. User: user@example.com (role: user)'",
    "value2": "email address of user, e.g. user@example.com",
    "value3": "role, either owner or user"
}
````

You can point the webhook to whatever service you'd like to use. The next sections will show some common examples.

### Using IFTTT

[IFTTT](https://ifttt.com/), or "IF This Then That", is a free service that lets you "connect" multiple APIs and actions.

After enabling the [webhook service](https://ifttt.com/maker_webhooks), you'll get a private key. The URL you need to use is:

````text
https://maker.ifttt.com/trigger/{event}/with/key/{key}
````

Replace `{event}` with an event name (e.g. `hereditas_auth`) and `{key}` with your IFTTT Webhook key (so messages are sent to yourself). For example:

````text
https://maker.ifttt.com/trigger/hereditas_auth/with/key/123abc456def
````

Note down your webhook URL, as we'll need it soon.

You can then configure your IFTTT applet to perform any action as a consequence of this. For example, you could send yourself an email, a message on Telegram, or a notification on Slack (or turn the lights red in your home, etc!).

If you send yourself a message, you can use `{{value1}}` as a pre-made mesasge, or you can write whatever body you prefer. As example:

````text
{{Value2}} (role: {{Value3}}) just logged into your Hereditas box at {{OccurredAt}}!
````

## Next step: Create the box

We now have all the information we need to create the Hereditas box in our laptop and start putting content in there.

<a class="hereditas-button" href="{{< relref "/guides/create-box.md" >}}">Create the box</a>

function (user, context, callback) {
    // Apply this rule only for Hereditas, and bypass it for other apps
    context.clientMetadata = context.clientMetadata || {};
    if (!context.clientMetadata.hereditas) {
        return callback(null, user, context);
    }

    // Skip if there's no webhook
    if (!configuration || !configuration.WEBHOOK_URL || configuration.WEBHOOK_URL === '0') {
        return callback(null, user, context);
    }

    // List of owners
    const owners = /*%OWNERS%*/;

    // Trigger the webhook
    const role = (owners.some((email) => email === user.email)) ? 'owner' : 'user';
    const body = {
        value1: `New Hereditas login on ${(new Date()).toUTCString()}. User: ${user.email} (role: ${role})`,
        value2: user.email,
        value3: role
    };
    const fetch = require('node-fetch@2.6.0');
    fetch(configuration.WEBHOOK_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    })
        // Ensure the response has a valid status code
        .then((response) => {
            if (response.ok) {
                return callback(null, user, context);
            } else {
                return Promise.reject('Invalid response status code');
            }
        })
        // Catch errors and fail (fail the login even if the notification fails to send)
        .catch((err) => {
            console.error(err);
            callback(new Error('Error sending the notification'));
        });
}

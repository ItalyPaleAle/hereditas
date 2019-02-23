function (user, context, callback) {
    // Apply this rule only for Hereditas, and bypass it for other apps
    context.clientMetadata = context.clientMetadata || {};
    if (!context.clientMetadata.hereditas) {
        return callback(null, user, context);
    }

    // Skip if there's no webhook
    if (!configuration || !configuration.WEBHOOK_URL) {
        return callback(null, user, context);
    }

    // Get metadata
    user.app_metadata = user.app_metadata || {};

    // Trigger the webhook
    const role = (user.app_metadata.hereditasRole === 'owner') ? 'owner' : 'user';
    const body = {
        value1: user.email,
        value2: role
    };
    const request = require('request');
    request({
        uri: configuration.WEBHOOK_URL,
        method: 'POST',
        json: true,
        body
    }, (error, response) => {
        if (error) {
            // Fail on errors, even for notifications
            console.log(error);
            callback(new Error('Error sending the notification'));
        }
        else {
            // Continue
            callback(null, user, context);
        }
    });
}

function (user, context, callback) {
    // Apply this rule only for Hereditas, and bypass it for other apps
    context.clientMetadata = context.clientMetadata || {};
    if (!context.clientMetadata.hereditas) {
        return callback(null, user, context);
    }

    // List of owners
    const owners = /*%OWNERS%*/;

    // Get the Auth0 management client
    const ManagementClient = require('auth0@2.13.0').ManagementClient;
    const management = new ManagementClient({
        domain: auth0.domain,
        clientId: configuration.AUTH0_CLIENT_ID,
        clientSecret: configuration.AUTH0_CLIENT_SECRET
    });

    // Get metadata
    const requestTime = context.clientMetadata.requestTime ? parseInt(context.clientMetadata.requestTime, 10) : 0;
    const waitTime = parseInt(context.clientMetadata.waitTime, 10);

    // Check if the user is an owner
    const isOwner = owners.some((email) => email === user.email);
    if (isOwner) {
        // Enrich the JWT with the app token
        if (context.idToken) {
            context.idToken['https://hereditas.app'] = {
                role: 'owner',
                token: context.clientMetadata.token,
                requestTime: 0,
                waitTime: waitTime
            };
        }

        // Reset the timer if it's running
        if (requestTime > 0) {
            const params = {client_id: context.clientID};
            const data = {client_metadata: {requestTime: '0'}};
            management.clients.update(params, data, (err, client) => {
                if (err) {
                    console.log(err);
                    callback(new Error('Error while updating client_metadata'));
                }
                else {
                    // Continue
                    callback(null, user, context);
                }
            });
        }
        else {
            // Continue
            callback(null, user, context);
        }
    }
    else {
        const now = parseInt(Date.now() / 1000, 10);

        // For non-owners: first, check if the timer has been started already, and we've reached the wait time
        if (requestTime > 0) {
            // Enrich the JWT with the app token
            if (context.idToken) {
                // If the wait time has passed, add the token
                const token = ((requestTime + waitTime) < now) ?
                    context.clientMetadata.token :
                    null;
                // Enrich the JWT
                context.idToken['https://hereditas.app'] = {
                    role: 'user',
                    token: token,
                    requestTime: requestTime,
                    waitTime: waitTime
                };
            }

            // Continue
            callback(null, user, context);
        }
        else {
            // Start the timer
            const params = {client_id: context.clientID};
            const data = {client_metadata: {requestTime: now.toString()}};
            management.clients.update(params, data, (err, client) => {
                if (err) {
                    console.log(err);
                    callback(new Error('Error while updating client_metadata'));
                }
                else {
                    // Enrich the JWT with the app token
                    if (context.idToken) {
                        context.idToken['https://hereditas.app'] = {
                            role: 'user',
                            requestTime: now,
                            waitTime: waitTime
                        };
                    }

                    // Continue
                    callback(null, user, context);
                }
            });
        }
    }
}

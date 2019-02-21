function (user, context, callback) {
    // List of authorized users
    const whitelist = [
        'user@example.com'
    ];

    // Apply this rule only for Hereditas, and bypass it for other apps
    context.clientMetadata = context.clientMetadata || {};
    if (!context.clientMetadata.hereditas) {
        return callback(null, user, context);
    }

    // Access should only be granted to verified users.
    if (!user.email || !user.email_verified) {
        return callback(new UnauthorizedError('Access denied.'));
    }

    // Check if the user's email address is whitelisted
    const userHasAccess = whitelist.some((email) => {
        return email === user.email;
    });
    if (!userHasAccess) {
        return callback(new UnauthorizedError('Access denied.'));
    }

    // Continue
    callback(null, user, context);
}

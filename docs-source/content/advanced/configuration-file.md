---
title: Configuration file
type: docs
---

# Configuration file

Each Hereditas working folder contains a JSON configuration file called `hereditas.json`.

The structure of the document is similar to the following:

````json
{
    "version": 20190222,
    "distDir": "dist",
    "contentDir": "content",
    "appToken": "...",
    "waitTime": 86400,
    "auth0": {
        "domain": "myhereditas.auth0.com",
        "managementClientId": "...",
        "managementClientSecret": "...",
        "hereditasClientId": "...",
        "rules": []
    },
    "users": [
        {
            "email": "me@example.com",
            "role": "owner"
        },
        {
            "email": "someone@example.com",
            "role": "user"
        }
    ],
    "urls": [
        "https://my.testhereditas.app"
    ],
    "webhookUrl": "https://example.com/webhook/token/abc123XYZ",
    "kdf": "pbkdf2",
    "pbkdf2": {
        "iterations": 100000
    },
    "processMarkdown": true
}
````

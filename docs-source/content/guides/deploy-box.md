---
title: Deploy the box
type: docs
---

# Deploy the box

In this last step, we're finally ready to deploy the static web app!

## Testing locally

## Choosing where to host your box

Your box is just a static HTML5 web app, with HTML, JavaScript and CSS files. You can deploy it on any service capable of serving HTML5 apps via HTTP(S).

Since all of your data is encrypted, Hereditas boxes are designed to be deployed on publicly-accessible endpoints too, safely.

Good solutions include [Azure Blob Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website), or [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html). Any provider that supports static website hosting should work; this service is often free, or very inexpensive.

While possible, we do not recommend deploying Hereditas on a cloud server or VPS (*what would happen if your credit card got canceled and your services stopped?*), nor inside a server in your home (*would your relatives know how to access it from within your LAN?*). Ultimately, however, it's up to you, your specific situation, and to the trust you put in the technical skills of your loved ones.


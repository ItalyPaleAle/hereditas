---
headless: true
---
{{! Set Mustache delimeters to ASP-style tags (this is a Mustache comment) }}
{{=<% %>=}}

* **Introduction**
  * [What is Hereditas]({{< relref "/" >}})
  * [Quickstart video]({{< relref "/introduction/quickstart-video.md" >}})
  * [Security model]({{< relref "/introduction/security-model.md" >}})
* **Guides**
  * [Get started]({{< relref "/guides/get-started.md" >}})
  * [Auth0 setup]({{< relref "/guides/auth0-setup.md" >}})
  * [Login notifications]({{< relref "/guides/login-notifications.md" >}})
  * [Create the box]({{< relref "/guides/create-box.md" >}})
  * [Build the static web app]({{< relref "/guides/build-static-web-app.md" >}})
  * [Managing users]({{< relref "/guides/managing-users.md" >}})
  * [Deploy the box]({{< relref "/guides/deploy-box.md" >}})
* **CLI Reference**
<%# index %>
  * [<% name %>]({{< relref "/cli/<% path %>" >}})
<%/ index %>
* **Advanced topics**
  * [Building self-contained binaries]({{< relref "/advanced/building-self-contained-binaries.md" >}})
  * [Auth0 manual configuration]({{< relref "/advanced/auth0-manual-configuration.md" >}})
  * [Configuration file]({{< relref "/advanced/configuration-file.md" >}})
  * [Index file]({{< relref "/advanced/index-file.md" >}})
* **Other**
  * [GitHub project page](https://github.com/ItalyPaleAle/hereditas)

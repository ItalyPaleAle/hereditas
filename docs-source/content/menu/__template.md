---
headless: true
---
{{! (Mustache comment) set delimeters to ASP-style tags }}
{{=<% %>=}}

* **Introduction**
  * [What is Hereditas]({{< relref "/" >}})
  * [Security Model]({{< relref "/introduction/security-model.md" >}})
* **Guides**
  * [Get started]({{< relref "/" >}})
  * [Auth0 setup]({{< relref "/guides/auth0-setup.md" >}})
  * [Login notifications]({{< relref "/guides/login-notifications.md" >}})
  * [Managing users]({{< relref "/" >}})
* **CLI Reference**
<%# index %>
  * [<% name %>]({{< relref "/cli/<% path %>" >}})
<%/ index %>
* **Advanced topics**
  * [Configuration file]({{< relref "/advanced/configuration-file.md" >}})
  * [Auth0 manual configuration]({{< relref "/advanced/auth0-manual-configuration.md" >}})
  * [Index file]({{< relref "/advanced/index-file.md" >}})

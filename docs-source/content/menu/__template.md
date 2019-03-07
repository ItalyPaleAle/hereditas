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
  * [Auth0 Setup]({{< relref "/" >}})
  * [Login notifications]({{< relref "/" >}})
  * [Managing users]({{< relref "/" >}})
* **CLI Reference**
<%# index %>
  * [<% name %>]({{< relref "/cli/<% path %>" >}})
<%/ index %>
* **Advanced topics**
  * [Auth0 manual configuration]({{< relref "/advanced/auth0-manual-configuration.md" >}})
  * [Index file]({{< relref "/advanced/index-file.md" >}})

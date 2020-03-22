---
title: Index file
type: docs
---

# Index file

Each Hereditas box contains an encrypted file named `_index`.

## Encryption details

The index file is encrypted, just like all other files, with AES-256-GCM. The encryption key is a unique, random sequence of 32 bytes (256 bits), which is wrapped with the master key and then stored (wrapped) at the beginning of the file. Additionally, the 12-byte IV is randomly generated too and stored in the file's data right after the wrapped key.

As a result of the usage of GCM, which is an authenticated cipher, the encryption step outputs an authentication tag too. The index file's authentication tag is stored inside the JavaScript file in cleartext and it's used to certify that the index file's content are authentic.

## Contents

In celartext, the index file is a JSON document listing all files inside the Hereditas box. For example:

````json
[
    {
       "path": "hello.md",
       "dist": "043bd2a8986b5ed805737ab8",
       "size": 248,
       "display": "html",
       "tag": "VczD/yHW3XtcH2nNyt9Q4w==",
       "processed": "markdown"
    },
    {
       "path": "photo.jpg",
       "dist": "122c1a87b03db8793eb90d53",
       "size": 10181034,
       "display": "image",
       "tag": "Zsh42WN+iy05M6CaXtlhPA=="
    },
    {
       "path": "folder/passwords.pdf",
       "dist": "715f14d0479b455ed481af9f",
       "size": 60600,
       "display": "attach",
       "tag": "CjurYwY6KeeTrmJsKxdR1A=="
    }
]
````

The JSON document is an array of objects each representing a file:

- `path`: The original path of the file in the content folder
- `dist`: Name of the encrypted file
- `size`: The size of the original file, in bytes
- `display`: Instructs the Hereditas web app on how to display the file. The generator determines this based on the file extension. Accepted values are:
    - `html`: Display the content as HTML fragment inside the page (for converted Markdown files)
    - `text`: Display the content as pre-formatted text, in a `<pre></pre>` HTML block (for text files)
    - `image`: Display the image inline (for images)
    - `attach`: Prompts to download the file
- `tag`: The authentication tag for the encrypted file, as returned by the GCM cipher
- `processed`: Contains information on how the file was pre-processed. If not present, it means the file wasn't pre-processed. Possible values:
    - `markdown`: The Markdown file was converted to HTML

# Debugging

In addition to using browser debugging tools for development, Umi recommends the following debugging approaches to assist in project debugging.

## Debugging the Development Build

If you need to debug the built artifacts during the development phase, such as `umi.js`, you can follow these steps. Let's take `umi.js` as an example. First, download the original `umi.js` file to the root directory of your project. Make any necessary edits for debugging purposes, and then refresh the browser. The project will use the modified `umi.js` file in the root directory. Once debugging is complete, you can simply delete the `umi.js` file from the root directory to revert to the original state.

Here's an example of how to do this:

```bash
# Download the umi.js file from the current project
$ curl http://127.0.0.1:8000/umi.js -O

# Make edits for debugging, for example, add an "debug!!!" alert
$ echo -e  '\n;alert("debug!!!");\n' >> umi.js

# Open the browser to see the alert popup

# To exit debugging and revert to the normal state
$ rm umi.js
```

You can follow similar steps to debug other JavaScript files.

## XSwitch

If you need to debug or validate your code changes on a specific domain, consider using the Chrome extension [XSwitch](https://chrome.google.com/webstore/detail/xswitch/idkjhjggpffolpidfkikidcokdkdaogg).

![xswitch-logo](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*fp9yRINN6aMAAAAAAAAAAAAAARQnAQ)

Suppose you want to debug your local code on the production project URL `https://www.myproject.com`. The project uses `https://www.myproject.com/umi.hash.js`. To validate your local project, you need to replace it with your local development environment's `http://127.0.0.1:8000/umi.js`.

Start your local environment using the `SOCKET_SERVER` environment variable to avoid continuous page refreshes due to connection issues with the socket server:

```bash
$ SOCKET_SERVER=http://127.0.0.1:8000/ npx umi dev
```

Next, configure resource forwarding rules in XSwitch:

```json
{
  "proxy": [
    // The resource at index 0 of the array will be replaced with the resource at index 1
    [
      "https://www.myproject.com/umi.2c8a01df.js",
      "http://127.0.0.1:8000/umi.js"
    ],
    // Using regex to handle loading of JS resources in split chunks
    [
      "https://www.myproject.com/(.*\.js)",
      "http://127.0.0.1:8000/$1"
    ],
    // Don't forget to replace CSS resources if you need to validate visual appearance
    [
      "https://www.myproject.com/umi.ae8b10e0.css",
      "http://127.0.0.1:8000/umi.css"
    ]
  ]
}
```

After refreshing the page, the content from the production domain will be replaced. This way, you can easily debug in a specific environment.

To exit debugging, simply disable the XSwitch extension.

![turn-off-xswitch](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*qXbNQJvz8-QAAAAAAAAAAAAAARQnAQ)

<Message type='success' emoji="💡">
If you frequently use XSwitch, you can create a rule to save it for later use.
</Message>

![rule](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*oWfiT6R0SJkAAAAAAAAAAAAAARQnAQ)

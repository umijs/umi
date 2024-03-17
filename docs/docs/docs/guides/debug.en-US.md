---
order: 14
toc: content
translated_at: '2024-03-17T10:34:34.282Z'
---

# Debugging

In addition to using the browser's debugging tools for development debugging, Umi also recommends the following debugging methods to assist with project debugging.

## Debugging dev Products

If you need to debug the build product of the project during the dev stage, take `umi.js` as an example. First, download the original `umi.js` to the root directory of the current project. After editing it according to debugging needs, refresh the browser, and the `umi.js` used by the project will be replaced with the `umi.js` file in the root directory. If you need to restore it after debugging, just delete the `umi.js` in the root directory.

Example:
```bash
# Download the umi.js of the current project
$curl http://127.0.0.1:8000/umi.js -O

# Add the content you want to debug, for example, add an "debug!!!" alert
$ echo -e  '\n;alert("debug!!!");\n' >> umi.js
# Open the browser to see the alert box

# Exit debugging and return to normal state
$rm umi.js
```

The same can be done to debug other JavaScript files.

## XSwitch

If you need to debug or verify the current code modifications in a specific domain environment, we recommend using the Chrome plugin [XSwitch](https://chrome.google.com/webstore/detail/xswitch/idkjhjggpffolpidfkikidcokdkdaogg).


![xswitch-logo](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*fp9yRINN6aMAAAAAAAAAAAAAARQnAQ)


Suppose we want to debug local code on the live project address `https://www.myproject.com`. The project uses `https://www.myproject.com/umi.hash.js`, to verify the local project, we need to replace it with the local development environment's `http://127.0.0.1:000/umi.js`

First, start the local environment using the environment variable `SOCKET_SERVER` (to prevent continuous page refreshing due to the socket server not connecting).
```bash
$SOCKET_SERVER=http://127.0.0.1:8000/ npx umi dev
```

Then, configure the resource forwarding rules in XSwitch.
```json
{
  "proxy": [
    // The resource in the 0 item of the array will be replaced by the 1st item
    [
      "https://www.myproject.com/umi.2c8a01df.js",
      "http://127.0.0.1:8000/umi.js"
    ],
    // Using regex can easily handle the loading of js resources in the case of sub-packages
    [
      "https://www.myproject.com/(.*\.js)",
      "http://127.0.0.1:8000/$1",
    ],
    // If you need to verify visual presentation, don't forget to replace css resources
    [
      "https://www.myproject.com/umi.ae8b10e0.css",
      "http://127.0.0.1:8000/umi.css"
    ]
  ]
}
```

Refresh the page, and the content under the official domain will be replaced, making it convenient to debug in the specified environment.

To exit debugging, simply turn off the XSwitch plugin function.

![turn-off-xswitch](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*qXbNQJvz8-QAAAAAAAAAAAAAARQnAQ)

:::success{title=💡}
If you use XSwitch often, you can create a new rule for saving.
:::

![rule](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*oWfiT6R0SJkAAAAAAAAAAAAAARQnAQ)

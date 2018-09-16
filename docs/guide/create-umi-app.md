# Create a Project With create-umi

Umi provides scaffolding through [create-umi](https://github.com/umijs/create-umi), which includes some customization capabilities. The `yarn create` command is recommended because it ensures that every time you use the latest scaffolding.

First, use `yarn create umi` in the new directory.

```bash
$ mkdir myapp && cd myapp
$ yarn create umi
```

Then, select the function you need, checkout [plugin/umi-plugin-react](../plugin/umi-plugin-react.html) for the detailed description.

<img src="https://gw.alipayobjects.com/zos/rmsportal/mlEDcowMOSeXwLoukayR.png" />

Once determined, the directories and files will be automatically created based on your selection.

<img src="https://gw.alipayobjects.com/zos/rmsportal/ppRAiFpnZbpwDDuoFdPh.png" width="323" />

Then install the dependencies manually,

```bash
$ yarn
```

Finally, start local development server with `yarn start`.

```bash
$ yarn start
```

If it goes well, open [http://localhost:8000](http://localhost:8000) in the browser and you will see the following ui.

<img src="https://gw.alipayobjects.com/zos/rmsportal/YIFycZRnWWeXBGnSoFoT.png" width="754" />

---
translateHelp: true
---

# Deployment


## Plano padrão

O Umi é amigável para iniciantes por padrão, por isso não faz o carregamento sob demanda por padrão. Depois do `umi build`, será gerado três arquivos:` index.html`, `umi.js` e` umi.css`.

## Não produza arquivos html

Em alguns cenários, o arquivo html é entregue ao back-end para saída. A compilação do front-end não precisa gerar o arquivo html. Você pode configurar a variável de ambiente `HTML = none` para implementá-lo.

```bash
$ HTML=none umi build
```

## Implantar html no diretório não raiz

Os alunos costumam fazer esta pergunta:

> Por que meu desenvolvimento local é bom, nenhuma resposta após a implantação e nenhum erro é relatado?

**Sem erros! ** Este é um fenômeno típico de aplicativos implantados em caminhos não raiz. Por que existe esse problema? Como a rota não corresponde, por exemplo, você implanta o aplicativo em `/ xxx /` e, em seguida, visita `/ xxx / hello`, e o código corresponde a` / hello`, então não será correspondente e não há definição. A rota de fallback, como 404, exibirá uma página em branco.

Como lidar com isso?

Pode ser resolvido configurando [base] (../ config # base). 

```bash
export default {
  base: '/path/to/your/app/root',
};
```

## Usar histórico de hash

Pode ser resolvido configurando [history] (../ config # history) para `hash`. 

```bash
export default {
  history: { type: 'hash' },
};
```

## Carga sob demanda

Para obter o carregamento sob demanda, você precisa configurar [dynamicImport] (../ config # dynamicimport).

```js
export default {
  dynamicImport: {},
};
```

## Recursos estáticos no diretório não raiz ou no cdn

No momento, você precisa configurar [publicPath] (../ config # publicpath). Quanto ao publicPath? Consulte especificamente [documentação do webpack] (https://webpack.js.org/configuration/output/#output-publicpath) e aponte-o para o caminho onde estão localizados os recursos estáticos (js, css, fotos, fontes, etc.).

```js
export default {
  publicPath: "http://yourcdn/path/to/static/"
}
```

## Usar publicPath do tempo de execução

Para cenários em que o publicPath precisa ser gerenciado em html, como julgar o ambiente em html para produzir saídas diferentes, ele pode ser resolvido configurando [runtimePublicPath] (/ zh-CN / config / # runtimepublicpath).

```bash
export default {
  runtimePublicPath: true,
};
```

Em seguida, imprima em html:

```html
<script>
window.publicPath = <%= YOUR PUBLIC_PATH %>
</script>
```

## Estático

Em alguns cenários, não é possível fazer fallback HTML do lado do servidor, ou seja, para fazer com que cada rota produza o conteúdo de index.html, então ele precisa ser estático.

Por exemplo, no exemplo acima, configuramos em .umirc.js:

```js
export default {
  exportStatic: {},
}
```

Em seguida, execute umi build, que produzirá um arquivo html para cada rota.

```
./dist
├── index.html
├── list
│   └── index.html
└── static
    ├── pages__index.5c0f5f51.async.js
    ├── pages__list.f940b099.async.js
    ├── umi.2eaebd79.js
    └── umi.f4cb51da.css
```

> Nota: atualmente, a estatização não suporta cenários de roteamento variável.

## Sufixo HTML

Em alguns cenários estáticos, o arquivo de índice não é lido automaticamente, como no ambiente de contêiner da Alipay, então esse arquivo html não pode ser gerado.

```
├── index.html
├── list
│   └── index.html
```

Mas gere,

```
├── index.html
└── list.html
```

O método de configuração está em .umirc.js,

```js
export default {
  exportStatic: {
    htmlSuffix: true,
  },
}
```

umi build irá gerar,

```
./dist
├── index.html
├── list.html
└── static
    ├── pages__index.5c0f5f51.async.js
    ├── pages__list.f940b099.async.js
    ├── umi.2924fdb7.js
    └── umi.cfe3ffab.css
```

## Após estático, envie para qualquer caminho

```js
export default {
  exportStatic: {
    htmlSuffix: true,
    dynamicRoot: true,
  },
}
```

import webpack from '@umijs/deps/compiled/webpack';

class CssDependency extends webpack.Dependency {
  constructor(
    { identifier, content, media, sourceMap },
    context,
    identifierIndex,
  ) {
    super();

    this.identifier = identifier;
    this.identifierIndex = identifierIndex;
    this.content = content;
    this.media = media;
    this.sourceMap = sourceMap;
    this.context = context;
  }

  getResourceIdentifier() {
    return `css-module-${this.identifier}-${this.identifierIndex}`;
  }

  // eslint-disable-next-line class-methods-use-this
  getModuleEvaluationSideEffectsState() {
    return webpack.ModuleGraphConnection.TRANSITIVE_ONLY;
  }

  serialize(context) {
    const { write } = context;

    write(this.identifier);
    write(this.content);
    write(this.media);
    write(this.sourceMap);
    write(this.context);
    write(this.identifierIndex);

    super.serialize(context);
  }

  deserialize(context) {
    super.deserialize(context);
  }
}

if (webpack.util && webpack.util.serialization) {
  webpack.util.serialization.register(
    CssDependency,
    'mini-css-extract-plugin/dist/CssDependency',
    null,
    {
      serialize(instance, context) {
        instance.serialize(context);
      },
      deserialize(context) {
        const { read } = context;
        const dep = new CssDependency(
          {
            identifier: read(),
            content: read(),
            media: read(),
            sourceMap: read(),
          },
          read(),
          read(),
        );

        dep.deserialize(context);

        return dep;
      },
    },
  );
}

export default CssDependency;

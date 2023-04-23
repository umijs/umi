{{#middlewares}}
import {{name}} from "{{{path}}}";
{{/middlewares}}

export default async (req: any, res: any, next: any) => {

  {{#middlewares}}
  await new Promise((resolve) => {{name}}(req, res, resolve));
  {{/middlewares}}

  next();

}

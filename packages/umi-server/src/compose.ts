import { IHandler } from './index';

/**
 * render html handlers pipe
 * const resultHtml = compose(
 *   handler1,
 *   handler2,
 *   hanlder3,
 *   ...
 * )(html, args);
 *
 * @param handler (html, args) => html
 */
const compose: (...handler: IHandler[]) => IHandler = (...handler) =>
  handler.reduce((acc, curr) => (html, args) => curr(acc(html, args), args));

export default compose;

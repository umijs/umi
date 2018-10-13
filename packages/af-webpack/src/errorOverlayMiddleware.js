import launchEditor from 'react-dev-utils/launchEditor';
import launchEditorEndpoint from 'react-dev-utils/launchEditorEndpoint';

export default function createLaunchEditorMiddleware() {
  return function launchEditorMiddleware(req, res, next) {
    if (req.url.startsWith(launchEditorEndpoint)) {
      launchEditor(req.query.fileName, req.query.lineNumber);
      res.end();
    } else {
      next();
    }
  };
}

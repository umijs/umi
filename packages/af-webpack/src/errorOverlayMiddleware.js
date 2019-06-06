import launchEditor from 'react-dev-utils/launchEditor';
import launchEditorEndpoint from 'react-dev-utils/launchEditorEndpoint';

export default function createLaunchEditorMiddleware() {
  return function launchEditorMiddleware(req, res, next) {
    if (req.url.startsWith(launchEditorEndpoint)) {
      const lineNumber = parseInt(req.query.lineNumber, 10) || 1;

      launchEditor(req.query.fileName, lineNumber);
      res.end();
    } else {
      next();
    }
  };
}

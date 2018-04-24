import { JSDOM } from 'jsdom';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

// fixed jsdom miss
const documentHTML =
  '<!doctype html><html><body><div id="root"></div></body></html>';
const dom = new JSDOM(documentHTML);
global.window = dom.window;
global.document = dom.window.document;
global.navigator = global.window.navigator;

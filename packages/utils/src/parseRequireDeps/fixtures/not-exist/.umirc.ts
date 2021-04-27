import './config/foo';

import './notExist1'
import './notExist2/non-existent-file'
require('./not-exist3')

if (false) {
    require('./notExist4')
}

import { message } from 'antd';

export default {
  onError(err) {
    err.preventDefault();
    message.error(err.message);
  },
};

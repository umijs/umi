class LogServe {
  logList: string[];
  blockUrl: string;
  constructor() {
    this.logList = [];
    this.blockUrl = '';
  }

  clear = () => {
    this.logList = [];
    this.blockUrl = '';
  };

  push = (info: string) => {
    this.logList.push(info);
  };

  getList = () => this.logList;

  setBlockUrl = (url: string) => {
    this.blockUrl = url;
  };
  getBlockUrl = () => this.blockUrl;
}

export default LogServe;

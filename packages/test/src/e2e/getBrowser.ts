//@ts-ignore
import findChrome from 'carlo/lib/find_chrome';
import Puppeteer from 'puppeteer-core';

const puppeteerArgs = [
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--no-first-run',
  '--no-zygote',
  '--no-sandbox',
];

const headless = process.env.HEADLESS === 'none' ? false : true;

const getBrowser = async (): Promise<Puppeteer.Browser> => {
  try {
    // eslint-disable-next-line import/no-unresolved
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      args: puppeteerArgs,
      headless,
    });
    return browser;
  } catch (error) {
    // console.log(error)
  }

  try {
    // eslint-disable-next-line import/no-unresolved
    const puppeteer = require('puppeteer-core');
    const findChromePath = await findChrome({});
    const { executablePath } = findChromePath;
    const browser = await puppeteer.launch({
      executablePath,
      headless,
      args: puppeteerArgs,
    });
    return browser;
  } catch (error) {
    console.log('🧲 no find chrome');
  }
  throw new Error('no find puppeteer');
};

export default getBrowser;

import { execSync } from 'child_process';
import { join } from 'path';
//@ts-ignore
import findChrome from 'carlo/lib/find_chrome';
import detectInstaller from 'detect-installer';

const installPuppeteer = () => {
  // find can use package manger
  const packages = detectInstaller(join(__dirname, '../../'));
  // get installed package manger
  const packageName = packages.find(detectInstaller.hasPackageCommand) || 'npm';
  console.log(`🤖 will use ${packageName} install puppeteer`);
  const command = `${packageName} ${
    packageName.includes('yarn') ? 'add' : 'i'
  } puppeteer`;
  execSync(command, {
    stdio: 'inherit',
  });
};

const initPuppeteer = async () => {
  try {
    // eslint-disable-next-line import/no-unresolved
    const findChromePath = await findChrome({});
    const { executablePath } = findChromePath;
    console.log(`🧲 find you browser in ${executablePath}`);
    return;
  } catch (error) {
    console.log('🧲 no find chrome');
  }

  try {
    require.resolve('puppeteer');
  } catch (error) {
    // need install puppeteer
    await installPuppeteer();
  }
};

export default initPuppeteer;

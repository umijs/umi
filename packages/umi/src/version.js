import chalk from 'chalk';
import * as path from 'path';
import { existsSync, readdirSync } from 'fs';
export default function(opts = {}) {
  let umiSameAsCore = [];
  const pkg = require(path.resolve(__dirname, '..', 'package.json'));
  let projPkg;
  try {
    projPkg = require(path.resolve(this.project.root, 'package.json'));
  } catch (exception) {
    projPkg = undefined;
  }

  const patterns = [
    /^@babel\/runtime$/,
    /^babel-preset-umi$/,
    /^umi-build-dev$/,
    /^umi-test$/,
  ];

  const nodeModules = findUp('node_modules', __dirname);
  const versions = [
    ...Object.keys((pkg && pkg['dependencies']) || {}),
    ...Object.keys((pkg && pkg['devDependencies']) || {}),

    // Add all node_modules and node_modules/@*/*
    ...readdirSync(nodeModules).reduce((acc, name) => {
      if (name.startsWith('@')) {
        return acc.concat(
          readdirSync(path.resolve(nodeModules, name)).map(
            subName => name + '/' + subName,
          ),
        );
      } else {
        return acc.concat(name);
      }
    }, []),
  ]
    .filter(x => patterns.some(p => p.test(x)))
    .reduce((acc, name) => {
      if (name in acc) {
        return acc;
      }

      acc[name] = getVersion(name, nodeModules);
      return acc;
    }, {});

  let umiVersion = pkg.version;
  if (!(pkg._from && pkg._resolved)) {
    umiVersion = '@local';
  }
  const namePad = ' '.repeat(
    Object.keys(versions).sort((a, b) => b.length - a.length)[0].length + 3,
  );
  const asciiArt = `
  _    _  __  __  _____ 
 | |  | ||  \\/  ||_   _|
 | |  | || \\  / |  | |  
 | |  | || |\\/| |  | |  
 | |__| || |  | | _| |_ 
  \\____/ |_|  |_||_____|
   `
    .split('\n')
    .map(x => chalk.cyan(x))
    .join('\n');

  console.log(asciiArt);
  console.log(
    `
      Umi: ${umiVersion}
      Node: ${process.versions.node}
      OS: ${process.platform} ${process.arch}
      ... ${umiSameAsCore
        .sort()
        .reduce((acc, name) => {
          // Perform a simple word wrap around 60.
          if (acc.length == 0) {
            return [name];
          }
          const line = acc[acc.length - 1] + ', ' + name;
          if (line.length > 60) {
            acc.push(name);
          } else {
            acc[acc.length - 1] = line;
          }
          return acc;
        }, [])
        .join('\n... ')}

      Package${namePad.slice(7)}Version
      -------${namePad.replace(/ /g, '-')}------------------
      ${Object.keys(versions)
        .map(
          module =>
            `${module}${namePad.slice(module.length)}${versions[module]}`,
        )
        .sort()
        .join('\n')}
    `.replace(/^ {6}/gm, ''),
  );
}

function getVersion(moduleName, nodeModules) {
  try {
    if (nodeModules) {
      const modulePkg = require(path.resolve(
        nodeModules,
        moduleName,
        'package.json',
      ));
      return modulePkg.version;
    }
  } catch (_) {}

  return '<error> or <local>';
}

function findUp(names, from) {
  if (!Array.isArray(names)) {
    names = [names];
  }
  const root = path.parse(from).root;

  let currentDir = from;
  while (currentDir && currentDir !== root) {
    for (const name of names) {
      const p = path.join(currentDir, name);
      if (existsSync(p)) {
        return p;
      }
    }

    currentDir = path.dirname(currentDir);
  }

  return null;
}

//https://github.com/dvajs/dva-cli/blob/master/src/install.js
import which from 'which';
function runCmd(cmd, args, fn) {
  args = args || [];
  var runner = require('child_process').spawn(cmd, args, {
    // keep color
    stdio: 'inherit',
  });
  runner.on('close', function(code) {
    if (fn) {
      fn(code);
    }
  });
}

function findNpm() {
  var npms =
    process.platform === 'win32'
      ? ['tnpm.cmd', 'cnpm.cmd', 'npm.cmd']
      : ['tnpm', 'cnpm', 'npm'];
  for (var i = 0; i < npms.length; i++) {
    try {
      which.sync(npms[i]);
      console.log('use npm: ' + npms[i]);
      return npms[i];
    } catch (e) {}
  }
  throw new Error('please install npm');
}
function findGit() {
  try {
    var git = which.sync('git');
    console.log('use git:');
    return git;
  } catch (e) {}
  throw new Error('please install git');
}
export default function(type, args, done) {
  switch (type) {
    case 'npm':
      var npm = findNpm();
      var npmArgs = args || ['install'];
      runCmd(which.sync(npm), npmArgs, function() {
        done();
      });
      break;
    case 'git':
      var git = findGit();
      runCmd(git, args, function() {
        done();
      });
      break;
    default:
      runCmd(type, args, function() {
        done();
      });
      break;
  }
}

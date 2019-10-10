// function isChunkParsed(chunk) {
//   return (typeof chunk.parsedSize === 'number');
// }

function walkModules(modules = [], cb) {
  for (const module of modules) {
    if (cb(module) === false) return false;

    if (module.groups) {
      if (walkModules(module.groups, cb) === false) {
        return false;
      }
    }
  }
  return false;
}

// function elementIsOutside(elem, container) {
//   return !(elem === container || container.contains(elem));
// }

class Analyze {
  public cid = 0;
  public allChunks = null;
  public selectedChunks = null;

  public cache = {
    visibleChunks: null,
  };
  constructor(chartData) {
    this.setModules(chartData);
  }

  public setModules(modules) {
    walkModules(modules, module => {
      module.cid = this.cid++;
    });

    this.allChunks = modules;
    this.selectedChunks = this.allChunks;
  }

  public get visibleChunks() {
    return this.allChunks;
  }

  public get activeSize() {
    return 'parsedSize';
  }
}

export { Analyze };
//

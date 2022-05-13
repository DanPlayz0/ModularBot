module.exports = class ModuleLoader {
  constructor(client) {
    this.client = client;
  }

  load() {
    return new Promise(async (resolve) => {
      const modules = this.client.pkg.fs.readdirSync(this.client.pkg.path.join(process.cwd(), 'modules'));
      for (let module of modules) await this.loadModule(module);
      resolve(true);
    })
  }

  async loadModule (moduleName) {
    const moduleFilePath = this.client.pkg.path.join(process.cwd(), 'modules', moduleName);
    try {
      let moduleFile = require(moduleFilePath+this.client.pkg.path.sep);
      if(!moduleFile || typeof moduleFile !== 'function') return false;
      moduleFile = new moduleFile(this.client);
      if(!moduleFile.enabled) return false;

      moduleFile.name = moduleName;
      moduleFile.path = moduleFilePath;
      await moduleFile._init();
  
      this.client.modules.set(moduleName, moduleFile);
    } catch (err) {
      if(!err.message.includes('Cannot find module')) console.error(err);
      return false;
    }
  }

  reload(moduleName) {
    try {
      this.unload(moduleName);
      this.load(moduleName);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
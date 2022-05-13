module.exports = class Module {
  constructor(client, mConfig) {
    this.client = client;
    
    this.name = null; // Defined on load
    this.path = null; // Defined on load

    this.enabled = mConfig.enabled ?? true;
    this.guildModule = mConfig.guildModule ?? true;

    this.commands = new this.client.pkg.Discord.Collection();
    this.events = new this.client.pkg.Discord.Collection();
  }

  beforeLoad() {}
  afterLoad() {}

  _init () {
    this.beforeLoad();
    this._$loadEvents();
    this._$loadCommands();
    this.afterLoad();
    return true;
  }
  
  _$loadCommands() {
    try {
      if(!this.client.pkg.fs.existsSync(this.client.pkg.path.join(this.path, 'commands'))) return;
      const commands = this.client.pkg.fs.readdirSync(this.client.pkg.path.join(this.path, 'commands'));
      for(let commandName of commands) this._$loadCommand(commandName);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  _$loadEvents() {
    try {
      if(!this.client.pkg.fs.existsSync(this.client.pkg.path.join(this.path, 'events'))) return;
      const events = this.client.pkg.fs.readdirSync(this.client.pkg.path.join(this.path, 'events'));
      for(let eventName of events) this._$loadEvent(eventName)
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  _$loadEvent(eventName) {
    try {
      const cEventName = eventName.replace(/.js$/,'');
      if(cEventName.includes('.')) return false;
      const eventFilePath = this.client.pkg.path.join(this.path, 'events', eventName);
      let eventFile = require(eventFilePath);
      if(!eventFile) return false;
      eventFile = new eventFile(this.client);
      if(!eventFile.enabled) return false;
      eventFile.name = cEventName;
      eventFile.path = eventFilePath;
      this.events.set(cEventName, eventFile);
      return true;
    } catch (err) {
      return false;
    }
  }

  _$loadCommand(commandName) {
    try {
      const cCommandName = commandName.replace(/.js$/,'');
      if(cCommandName.includes('.')) return false;
      const commandFilePath = this.client.pkg.path.join(this.path, 'commands', commandName);
      let commandFile = require(commandFilePath);
      if(!commandFile) return false;
      commandFile = new commandFile(this.client);
      if(!commandFile.enabled) return false;
      commandFile.commandData.name = cCommandName;
      commandFile.path = commandFilePath;
      this.commands.set(cCommandName, commandFile);
      return true;
    } catch (err) {
      return false;
    }
  }
}
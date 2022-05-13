const events = require('../util/ClientEvents.js');

module.exports = class EventManager {
  constructor(client) {
    this.client = client;

    this.events = new Map();
  }

  cacheEvents() {
    return new Promise((resolve) => {
      for(let eventName of Object.values(events)) {
        const eventFiles = [];
        for(let i of this.client.modules.keys()) {
          const module = this.client.modules.get(i);
          const moduleEvents = [...module.events.values()].filter(m => m.listening.includes(eventName));
          eventFiles.push(...moduleEvents);
        }
        this.events.set(eventName, eventFiles);
      }
      resolve();
    })
  }

  fireEvent(eventName, ...args) {
    const eventFiles = this.events.get(eventName);
    if(!eventFiles.length) return false;
    for(let ef of eventFiles) {
      if(ef.mapping.hasOwnProperty(eventName)) ef.mapping[eventName](eventName, this.client, args)
      else ef.run(eventName, this.client, args)
    }
    return true;
  }

  listenEvents() {
    return new Promise(async (resolve, reject) => {
      if(this._$listenEvents) return reject();
      this._$listenEvents = true;
      await this.cacheEvents();
      for(let i of Object.values(events)) this.client.on(i, (...args) => this.fireEvent(i, ...args));
      resolve();
    })
  }
}
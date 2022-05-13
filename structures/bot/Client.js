const Discord = require('discord.js');

module.exports = class Client extends Discord.Client {
  constructor() {
    super({
      intents: Object.keys(Discord.Intents.FLAGS)
    });

    this.config = require('../../config.js');
    this.color = this.config.colors;

    this.pkg = {
      fs: require('fs'),
      path: require('path'),
      Discord,
      stringToolkit: require('string-toolkit')
    }

    this.redis = new (require('ioredis'))(`redis://${this.config.redis.host}:${this.config.redis.port}`);
    this.mongo = null;

    this.modules = new Discord.Collection();
    this.cooldowns = new Discord.Collection();
    this.startedAt = new Date();

    this.database = null //new (require('../managers/DatabaseManager'))(this);
    this.commandManager = new (require('../managers/CommandManager'))(this);
    this.eventManager = new (require('../managers/EventManager'))(this);
    this.webhooks = new (require('../managers/WebhookManager'))(this);

    this.loader = new (require('./Loader'))(this);
  }

  async init () {
    console.log('loader')
    await this.loader.load();
    console.log('events')
    await this.eventManager.listenEvents();
    console.log('commands')
    await this.commandManager.cache();
    console.log('login')
    return this.login(this.config.token);
  }

  shutdown () {
    this.loader.destroy();
    this.eventManager.listenEvents();
    process.exit(0);
  }
}
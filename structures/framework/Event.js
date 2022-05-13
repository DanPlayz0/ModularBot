module.exports = class Event {
  constructor(client, options) {
    this.client = client;
    this.name = null;
    this.path = null;
    // Configuration
    this.enabled = options.enabled ?? false;
    this.ws = options.ws ?? false;

    // Which events to listen for
    this.listening = options.listening ?? [];
    this.mapping = options.mapping ?? {};
  }

  run() {
    throw new Error('Command run method not implemented');
  }
}

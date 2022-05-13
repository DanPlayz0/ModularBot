const Event = require("../../../structures/framework/Event");
const { ClientReady } = require('../../../structures/util/ClientEvents');

module.exports = class ReadyEvt extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
      listening: [ClientReady],
    });
    this.mapping = {};
  }

  async run (eventName, client) {
    console.log(`Logged in and running as ${client.user.tag}`);
  }
}
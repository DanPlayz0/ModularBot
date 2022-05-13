const Event = require("../../../structures/framework/Event");
const { MessageReactionAdd, MessageReactionRemove } = require('../../../structures/util/ClientEvents');

module.exports = class Reactions extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
      listening: [MessageReactionAdd, MessageReactionRemove],
    });
    this.mapping = {
      [MessageReactionAdd]: (eventName,client,[message,user]) => this.add(client,message,user),
      [MessageReactionRemove]: (eventName,client,[message,user]) => this.remove(client,message,user),
    }
  }

  async add (client, message, user) {
    if(message.emoji.name !== "⭐") return;
    console.log('Star added')
  }

  async remove (client, message, user) {
    if(message.emoji.name !== "⭐") return;
    console.log('Star removed')
  }
}
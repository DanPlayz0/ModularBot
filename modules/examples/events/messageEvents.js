const Event = require("../../../structures/framework/Event");
const { MessageCreate, MessageUpdate } = require('../../../structures/util/ClientEvents');


module.exports = class MessageEvents extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
      listening: [MessageCreate, MessageUpdate],
    });
    this.mapping = {
      messageCreate: (eN,c,[message]) => this.message(eN,c,message,false),
      messageUpdate: (eN,c,[old,message]) => {
        if (old.partial || message.partial) return;
        if (old == message || old.content == message.content) return;
        return this.message(eN,c,message,true);
      },
    }
  }

  // The following function handles everything for commands.
  async message(eventName, client, message, isEdited) {
    console.log(`This function ran when the ${eventName} ran. ${isEdited ? 'We also know the message was edited because of the variable `isEdited`' : ''}`)
  }
}
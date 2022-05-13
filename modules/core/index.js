const Module = require("../../structures/framework/Module");

/**
 * This is an important module, 
 * as it has most of the events for the bot to function properly.
 * 
 * Though you may choose to delete this folder and make your own "module"
 */
module.exports = class Core extends Module {
  constructor(client) {
    super(client, {
      enabled: true,
      guildModule: false, // Can a guild customize the module?
    })
  }
}
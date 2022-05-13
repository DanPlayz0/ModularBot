const Module = require("../../structures/framework/Module");

/**
 * This is an example module
 */
module.exports = class Examples extends Module {
  constructor(client) {
    super(client, {
      enabled: false,
      guildModule: false, // Can a guild customize the module?
    })
  }
}
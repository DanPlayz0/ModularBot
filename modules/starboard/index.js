const Module = require("../../structures/framework/Module");

module.exports = class StarBoard extends Module {
  constructor(client) {
    super(client, {
      enabled: true,
      guildModule: true,
    })
  }
}
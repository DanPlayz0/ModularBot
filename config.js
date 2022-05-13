const private = require('./config-private.js');
module.exports = {
  token: private.token,
  
  admins: ['209796601357533184'],

  redis: {
    host: private?.redis?.host || 'localhost',
    port: private?.redis?.port ?? 6379,
    prefix: 'MODULARBOT:'
  },
  
  domain: "https://modularbot.enx.so",

  colors: {
    primary: "ORANGE",
    success: "GREEN",
    danger: "RED",
  },

  webhooks: {
    shard: private.webhooks.shard,
    error: private.webhooks.error,
    guilds: private.webhooks.guilds,
    command: private.webhooks.command
  },
}
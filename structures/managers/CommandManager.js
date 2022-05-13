module.exports = class CommandManager {
  constructor (client) {
    this.client = client;

    this.commands = new this.client.pkg.Discord.Collection();
  }

  has (name) {
    return !!this.get(name);
  }
  
  get (name) {
    return this.commands.get(name) || this.commands.find(x => x.conf.aliases.includes(name));
  }

  async cache () {
    for(let i of this.client.modules.keys()) {
      const module = this.client.modules.get(i);
      if(!module.commands.size) continue;
      for(let command of module.commands.keys()) {
        this.commands.set(command, module.commands.get(command));
      }
    }
  }



  permissionsOf (user, member = false, guildDb = null) {
    if(this.client.config.admins.includes(user.id)) return accessLevels.find(m=>m.name==="developer");
    if(member) {
      if(user.id === user.guild.ownerId) return accessLevels.find(m=>m.name==="owner");
      if(user.permissions.has(this.client.pkg.Discord.Permissions.FLAGS['MANAGE_GUILD'])) return accessLevels.find(m=>m.name==="administrator");
      if(guildDb) {
        // TODO: Add more ranks that can be assigned
        if(guildDb.roles.moderator && user.roles.cache.has(guildDb.roles.moderator)) return accessLevels.find(m=>m.name==="moderator");

      }
    }
    return accessLevels.find(m=>m.name==="user");
  }

  checkAccess(member, guildDb = null, requiredLevel = 'user') {
    const currentAccess = this.permissionsOf(member, !!member?.guild, guildDb);
    const lookingFor = accessLevels.find(m=> typeof requiredLevel === 'string' ? (m.name === requiredLevel.toLowerCase()) : (m.level === requiredLevel));
    if(currentAccess.level >= lookingFor.level) return true;
    return false;
  }

  getAccessLevel(lookingFor) {
    const level = accessLevels.find(m=> typeof lookingFor === 'string' ? (m.name === lookingFor.toLowerCase()) : (m.level === lookingFor));
    return level?.level ?? 0;
  }
}
const accessLevels = [
  {name: "user", level: 0},
  {name: "moderator", level: 1},
  {name: "administrator", level: 2},
  {name: "owner", level: 4},
  {name: "developer", level: 99},
];
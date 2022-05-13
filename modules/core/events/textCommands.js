const Event = require("../../../structures/framework/Event");
const { MessageCreate, MessageUpdate } = require('../../../structures/util/ClientEvents');
const { TextCommandContext } = require('../../../structures/framework/CommandContext')

module.exports = class Commands extends Event {
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
    if (message.partial) await message.fetch();
    if (client.cooldowns.has(`${message.guild.id}-${message.author.id}-missingperms`)) return;
    if (message.guild && ["SEND_MESSAGES", "READ_MESSAGE_HISTORY"].every(perm => message.guild.me.permissions.has(client.pkg.Discord.Permissions.FLAGS[perm]) === false)) {
      client.cooldowns.set(`${message.guild.id}-${message.author.id}-missingperms`, Date.now());
      const e = new MessageEmbed()
        .setTitle('Missing Bot Permissions')
        .setColor('RED')
        .setDescription(`I am missing \`${["SEND_MESSAGES", "READ_MESSAGE_HISTORY"].filter(p => !message.guild.me.permissions.has(Permissions.FLAGS[p])).join(", ").toUpperCase()}\` to run this command in ${message.channel}.`);
      message.author.send({ embeds: [e] }).then(m => setTimeout(() => { m.delete(); client.cooldowns.delete(`${message.guild.id}-${message.author.id}-missingperms`); }, 10000));
      return;
    }
    if (message.author.bot) return;

    // const settings = message.guild ? await client.database.settings.get(message.guild.id) : { prefix: [']'] };

    // Prefix related tasks
    const prefixes = [';;'] //settings.prefix;
    const fixedUsername = escapeRegExp(client.user.username);
    const PrefixRegex = new RegExp(`^(<@!?${client.user.id}>|${fixedUsername}${prefixes ? prefixes.map(m => `|${escapeRegExp(m)}`).join('') : ""})`, 'i', '(\s+)?');
    let usedPrefix = message.content.match(PrefixRegex);
    usedPrefix = usedPrefix && usedPrefix.length && usedPrefix[0];
    if (!usedPrefix) return;

    const args = message.content.slice(usedPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const cmd = client.commandManager.get(command);
    const ctx = new TextCommandContext({ client: this.client, args, message, prefix: usedPrefix, query: args.join(' '), isEdited });
    
    // Mention related tasks
    const mentioned = (new RegExp(`^(<@!?${client.user.id}>)`)).test(message.content);
    const helpPrefix = `👋 Hello! You can use any of the following prefixes: ${prefixes.map(m => `\`${m}\``).join(' ')}`;
    if (!cmd && mentioned) return ctx.sendMsg(helpPrefix);
    
    // Check if command exists.
    if (!cmd) {
      //#region Custom Commands
      // const customCommand = await client.database.customcommands.get(message.guild.id, command);
      // if (customCommand) return client.services.customcommands.run(message, customCommand.name, customCommand, { args, command });
      //#endregion
      return;
    }
    
    client.webhooks.command.send({ content: `${ctx.author.tag} \`${ctx.author.id}\` used **${cmd.commandData.name}** in ${message.guild.name} \`${message.guild.id}\` ||${usedPrefix}${command} ${args.join(' ')}`.slice(0, 1995) + '||', allowedMentions: { parse: [] } })
    
    // Some commands may not be useable in DMs. This check prevents those commands from running
    if (cmd && !message.guild && cmd.conf.guildOnly) return ctx.sendMsg("This command is unavailable via private message. Please run this command in a guild.");

    //#region Bot Blacklist System 
    // "authordata" is defined above in AFK system.
    // if ((message.author.id != client.config.owner) && authordata.blacklist.toggle) {
    //   const e = new MessageEmbed()
    //     .setAuthor(message.author.username, message.author.displayAvatarURL({ format: 'png', dynamic: true }))
    //     .setColor('RED')
    //     .setDescription(`You do not have permission to run this command because...\nYou are currently blacklisted from **${client.user.tag}**.\nTo appeal a blacklist, please join our [support server](${client.config.supportServerInvite}).`)
    //     .addField(`Reason:`, authordata.blacklist.message);
    //   return ctx.sendMsg(e);
    // }
    //#endregion

    //#region Command Toggles 
    // if (settings.cmdToggles.includes(cmd.help.name) && message.channel.type != "DM") {
    //   const e = new MessageEmbed()
    //     .setColor('RED')
    //     .setDescription('This command was disabled by a server administrator.')
    //   return ctx.sendMsg(e);
    // }
    //#endregion

    //#region Bot Permission Lock
    if (!client.commandManager.checkAccess(ctx.member, null, cmd.conf.level)) {
      const requiredLevel = client.commandManager.getAccessLevel(cmd.conf.level);
      const e = new ctx.MessageEmbed()
        .setTitle('Invalid Permissions')
        .setColor('RED')
        .setDescription(`You have to be ${(requiredLevel.level == 4) ? 'the' : 'a'} **${cmd.conf.level}** to use this command.`);
      ctx.sendMsg(e);
      // client.logger.log(`${permLevels.find(l => l.level === level).name} ${message.author.username} (${message.author.id}) ran unauthorized command ${cmd.help.name} ${args.join(' ')}`, "unauthorized");
      return;
    }

    // User Perms
    if (cmd.permissions.user.length > 0 && cmd.permissions.user.every(perm => message.member.permissions.has(client.pkg.Discord.Permissions.FLAGS[perm]) === false)) {
      const e = new MessageEmbed()
        .setTitle('Missing User Permissions')
        .setColor('RED')
        .setDescription(`You are missing \`${cmd.permissions.user.filter(p => !message.member.permissions.has(client.pkg.Discord.Permissions.FLAGS[p])).join(", ").toUpperCase()}\` to run this command`);
      message.channel.send({ embeds: [e] });
      return;
    }

    // Bot Perm
    if (cmd.permissions.bot.length > 0 && cmd.permissions.bot.every(perm => message.guild.me.permissions.has(client.pkg.Discord.Permissions.FLAGS[perm]) === false)) {
      const e = new MessageEmbed()
        .setTitle('Missing Bot Permissions')
        .setColor('RED')
        .setDescription(`I am missing \`${cmd.permissions.bot.filter(p => !message.guild.me.permissions.has(client.pkg.Discord.Permissions.FLAGS[p])).join(", ").toUpperCase()}\` to run this command.`);
      message.channel.send({ embeds: [e] });
      return;
    }
    //#endregion

    //#region Command Options
    // if (Object.keys(cmd.conf.options).length > 0) {
    //   const options = cmd.conf.options.map(m => m.toLowerCase())
    //   if (options.includes('nsfw')) {
    //     if (message.channel.nsfw == false) {
    //       const e = new MessageEmbed()
    //         .setColor(client.color.primary)
    //         .setImage(`https://i.imgur.com/oe4iK5i.gif`)
    //         .setDescription('Use NSFW commands in a NSFW marked channel (look in channel settings, dummy)')
    //         .setFooter({text: message.author.username, iconURL: message.author.displayAvatarURL({ format: 'png' }) })
    //         .setTimestamp()
    //       return ctx.sendMsg(e);
    //     }
    //   }
    //   if (options.includes('checkvoted')) {
    //     if ((await this.checkVoted(message.author.id)) == false) {
    //       const e = new MessageEmbed()
    //         .setTitle('Vote Locked')
    //         .setDescription(`Please vote on [voidbots.net](https://voidbots.net/bot/${client.user.id}/vote) to gain access to this command. If you have recently voted it may take up to 5 minutes to register your vote.`)
    //         .setColor('RED')
    //         .setTimestamp();
    //       return ctx.sendMsg(e);
    //     }
    //   }
    //   if (options.includes('voice')) if (!message.member.voice.channel) return ctx.sendMsg("You must join a voice channel to use this command.");
    //   if (options.includes('samevoice')) if (message.guild.me.voice.channel && message.guild.me.voice.channel != message.member.voice.channel) return ctx.sendMsg('You must be in the same voice channel as the bot!');
    // }
    //#endregion

    //#region Command Cooldown System
    if (client.cooldowns.has(`${message.guild.id}-${message.author.id}-${cmd.commandData.name}-silent`)) return;
    if (client.cooldowns.has(`${message.guild.id}-${message.author.id}-${cmd.commandData.name}`)) {
      client.cooldowns.set(`${message.guild.id}-${message.author.id}-${cmd.commandData.name}-silent`, Date.now());
      setTimeout(() => client.cooldowns.delete(`${message.guild.id}-${message.author.id}-${cmd.commandData.name}-silent`), 5000);

      const expirationTime = client.cooldowns.get(`${message.guild.id}-${message.author.id}-${cmd.commandData.name}`) + cooldownAmount;
      const timeLeft = (expirationTime - Date.now()) / 1000;
      return ctx.sendMsg(`${message.author.toString()}, please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.commandData.name}\` command.`);
    }
    client.cooldowns.set(`${message.guild.id}-${message.author.id}-${cmd.commandData.name}`, Date.now());
    setTimeout(() => client.cooldowns.delete(`${message.guild.id}-${message.author.id}-${cmd.commandData.name}`), (cmd.conf.cooldown || 0) * 1000);
    //#endregion

    // If the command exists, **AND** the user has permission, run it.
    cmd._entrypoint(ctx, 'message');
  }
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\\`]/g, '\\$&');
}
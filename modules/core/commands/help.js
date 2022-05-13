const Command = require("../../../structures/framework/Command.js");

module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      description: "Displays all the available commands for you.",
      category: "Utility",
      options: [
        {
          type: 'STRING',
          name: 'command',
          description: 'The name of the command to view.',
        }
      ],
      aliases: ["h", "?"],
      level: "User"
    });
  }

  async runMessage(ctx) {
    const cat = ctx.args.join(' ');

    const clientCmds = ctx.client.commandManager.commands.sort((a,b) => a.commandData.name.localeCompare(b.commandData.name));
    const myCommands = ctx.guild ?
      clientCmds.filter(cmd => ctx.client.commandManager.checkAccess(ctx.member, null, cmd.conf.level)) :
      clientCmds.filter(cmd => ctx.client.commandManager.checkAccess(ctx.member, null, cmd.conf.level) && cmd.conf.guildOnly !== true);
    const CommandNames = [...myCommands.keys()];

    const embed = new ctx.MessageEmbed()
      .setColor(ctx.client.color.primary)
      .setFooter({ text: `${ctx.author.username} • Only commands you can run are shown.`, iconURL: ctx.author.displayAvatarURL({ format: 'png' }) });

    let query = ctx.args[0];
    if (query) {
      const commands = [];

      CommandNames.forEach((cmd) => {
        const command = myCommands.get(cmd);
        if (command.conf.category.toLowerCase() === cat.toLowerCase()) {
          commands.push(command);
        }
      });

      // if ("custom" === cat.toLowerCase()) {
      //   const customCommands = await ctx.client.database.customcommands.getAll({ guildid: ctx.guild.id });
      //   customCommands.forEach((ccmd, index) => {
      //     let obj = { commandData: { } };
      //     obj.commandData.name = ccmd.name;
      //     obj.commandData.description = ccmd.description;
      //     commands.push(obj);
      //   })
      // }

      const output = [];
      commands.forEach((cmd) => output.push(`\`${ctx.prefix}${cmd.commandData.name}\` - ${cmd.commandData.description}`));

      if (commands.length > 0) {
        embed.setTitle(`Help » ${query.toProperCase()}`)
        embed.setDescription(`${output.join('\n')}`);
        ctx.sendMsg(embed);
        return;
      }

      if (ctx.client.commandManager.has(query)) {
        let command = ctx.client.commandManager.get(query);
        embed.setTitle(`Help » ${command.commandData.name.toProperCase()}`)
        embed.addField(`Description`, command.commandData.description || "None");
        embed.addField(`Usage`, `${ctx.prefix}${command.commandData.name} ${command.commandData.options.map(m => m.required?`<${m.name}>`:`[${m.name}]`)}` || "None");
        embed.addField(`Aliases`, command.conf.aliases.join(', ') || "None");
        embed.addField(`Permission Level`, command.conf.level || "Error", true);
        embed.addField(`Category`, command.conf.category || "Error", true);
        ctx.sendMsg(embed);
      } else {
        embed.setTitle('Something went wrong!')
        embed.setColor('RED')
        embed.setDescription(`It seems **${query}** not a valid category, or a command name`);
        ctx.sendMsg(embed);
      }
      return;
    }

    const myCategories = [...new Set(CommandNames.map(m => myCommands.get(m).conf.category))];
    myCategories.sort((a, b) => a.localeCompare(b));
    
    const links = {
      // "Website": `${ctx.client.config.domain}`,
      // "Privacy Policy": `${ctx.client.config.domain}/privacy`,
      // "Invite Link": `${ctx.client.config.domain}/invite`,
      "Support Server": `https://discord.gg/KkS6yP8`,
      // "Dashboard": `${ctx.client.config.domain}/dashboard`,
      // "Void Bots": `https://voidbots.net/bot/${ctx.client.user.id}/`
    }

    embed.setTitle('Help')
      .setDescription(`Please select a category to see its available commands.\nUsage: \`${ctx.prefix}help <category>\``)
      .addField('Categories', myCategories.join('\n'), true)
      .addField('Other Links', Object.entries(links).map(m => `[${m[0]}](${m[1]})`).join('\n'), true)
    ctx.sendMsg(embed);
  }
};
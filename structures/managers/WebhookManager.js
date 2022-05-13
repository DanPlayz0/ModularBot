class WebhookClient {
  constructor(client, name, webhookConfig) {
    this.client = client;
    if(!webhookConfig) return {send: ()=>{ console.error(`Config is missing property 'webhooks.${name}'`) }};
    this.webhook = new this.client.pkg.Discord.WebhookClient(webhookConfig);
  }

  async send(content, options) {
    if (!content) throw ReferenceError('content is not defined');
    if (typeof content == 'object' && !(content instanceof this.client.pkg.Discord.MessageEmbed)) { options = content; content = undefined; }
    if (options instanceof this.client.pkg.Discord.MessageEmbed) options = { embeds: [options] };

    const newOptions = Object.assign({
      content: typeof content === 'string' ? content : undefined,
      embeds: content instanceof this.client.pkg.Discord.MessageEmbed ? [content] : [],
      allowedMentions: { repliedUser: false, parse: [] },
    }, options);

    return this.webhook.send(newOptions);
  }
}

module.exports = class WebhookManager {
  constructor(client) {
    this.client = client;

    // This could be a for loop 
    // (I just didnt wanna deal with it, 
    // easier to copy paste and ctrl+d to rename 
    // "shard -> error", and etc)
    if(!client.config.webhooks) throw TypeError("Config is missing 'webhooks' property")
    this.shard = new WebhookClient(this.client, 'shard', client.config?.webhooks?.shard);
    this.error = new WebhookClient(this.client, 'error', client.config?.webhooks?.error);
    this.guilds = new WebhookClient(this.client, 'guilds', client.config?.webhooks?.guilds);
    this.command = new WebhookClient(this.client, 'command', client.config?.webhooks?.command);
  }
}
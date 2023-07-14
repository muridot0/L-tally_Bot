const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { TallyService } = require('../utils/TallyService')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('get_all_spaces')
    .setDescription('This command fetches all the spaces within this server'),
  async execute(interaction) {
    const space = new TallyService()

    const spaces = await space.getAllSpaces()

    const spacesEmbed = new EmbedBuilder().setColor(0x0099FF).setTitle('Notgr server spaces')

    for (let i = 0; i < spaces.length; i++) {
      spacesEmbed.addFields({ name: '\u200B', value: `- ${spaces[i].spaceName}`})
    }
    await interaction.reply({
      content: 'Here is the list of spaces within this server'
    })
    await interaction.channel.send({ embeds: [spacesEmbed], ephemeral: true })
  }
}

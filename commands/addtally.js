const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add_tally')
    .setDescription('adds a tally for a specific user'),
  async execute(interaction) {
    await interaction.reply(`${interaction.user.username} added 1 tally`)
  }
}

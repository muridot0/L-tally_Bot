const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add_tally_to')
    .setDescription('adds a tally for a specific user')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The member to add a tally to')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('space')
        .setDescription('The space to add the tally to')
        .setRequired(true)
        .setMaxLength(100)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('target')
    const space = interaction.options.getString('space')
    // await interaction.reply(
    //   `${interaction.user.username} added 1 tally to ${user} in ${space}`
    // )
  }
}

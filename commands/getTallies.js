const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { TallyService } = require('../utils/TallyService')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('get_all_tallies_in')
    .setDescription('Shows you all the tallies within a tally space')
    .addStringOption((option) =>
      option
        .setName('space')
        .setDescription('The space that you want to get tallies from')
        .setRequired(true)
    ),
  async execute(interaction) {
    const spaceName = interaction.options.getString('space')
    const tally = new TallyService()

    const tallies = await tally.getTalliesInASpace(spaceName)

    const capitalise = (s) => {
      return s[0].toUpperCase() + s.slice(1)
    }

    const talliesEmbed = new EmbedBuilder().setTitle(`${capitalise(spaceName)} tallies`)

    for (let i = 0; i < tallies.length; i++){
      talliesEmbed.addFields({name: `${tallies[i].tallyName}   |`, value: `${tallies[i].tallyNumber}`, inline: true})
    }

    if(tallies.length === 0){
      await interaction.reply({content: `Space \`${spaceName}\` doesnt exist.`})
    } else {
      await interaction.reply({content: `Here is the list of tallies within ${spaceName}`})
      await interaction.channel.send({ embeds: [talliesEmbed], ephemeral: true })
    }

  }
}

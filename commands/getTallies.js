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

    const tallyFunction = (tallyArr) => {
      tallyArr.forEach((tally) => {
        console.log([
          { name: `${spaceName}`, value: `${tally.tallyName}`, inline: true },
          { name: 'Tally', value: `${tally.tallyNumber}`, inline: true }
        ])
      })
    }

      tallies.forEach((tally) => {
        console.log(tally.tallyName)
      })

    // console.log(tallyNames(tallies))

    // tallyFunction(tallies)

    const talliesEmbed = new EmbedBuilder().setColor(0x0099ff).addFields({
      name: `${spaceName}`,
      value: 'chale',
      inline: true
    })

    interaction.channel.send({ embeds: [talliesEmbed] })
    // await interaction.reply(`There are 5 tallies in ${tallies}`)
  }
}

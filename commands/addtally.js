
const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const { TallyService } = require('../utils/TallyService')

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
    await interaction.deferReply()
    const spaceName = interaction.options.getString('space')
    const user = interaction.options.getUser('target')
    const tally = new TallyService()

    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm Add')
      .setStyle(ButtonStyle.Success)

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary)

    const row = new ActionRowBuilder().addComponents(cancel, confirm)

    const tallyName = await tally.getTallyNumberByUserName(user.username)
    const name = tallyName.name
    const count = tallyName.number
    if (name) {
      const tallyNumber = await tally.patchTallyNumber(count, user.username)
      await interaction.editReply(
        `Added 1 tally to ${user} in ${spaceName}. Total tally for member is now ${tallyNumber.tallyNumber}`
      )
    } else {
      const response = await interaction.editReply({
        content: `${user} doesnt exist in the L-tally space \`${spaceName}\` would you like to add them ?`,
        components: [row]
      })

      const collectorFilter = (i) => i.user.id === interaction.user.id

      try {
        const confirmation = await response.awaitMessageComponent({
          filter: collectorFilter,
          time: 10000
        })
        if (confirmation.customId === 'confirm') {
          await tally.addTally(spaceName, user.username)
          await confirmation.update({
            content: `Added 1 tally to ${user} in ${spaceName}. Total tally for member is now 1`,
            components: []
          })
        } else if (confirmation.customId === 'cancel') {
          await confirmation.update({
            content: 'Action cancelled',
            components: []
          })
        }
      } catch (e) {
        await interaction.editReply({
          content: 'Confirmation not received within 1 minute, cancelling',
          components: []
        })
      }
    }
  }
}

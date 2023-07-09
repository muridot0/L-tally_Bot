const fs = require('node:fs')
const path = require('node:path')
const {
  Client,
  Collection,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  Channel
} = require('discord.js')
const { token } = require('./config.json')
const { request, json } = require('undici')
const { AuthService } = require('./utils/auth-service')
const { TallyService } = require('./utils/TallyService')
const axios = require('axios')

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.commands = new Collection()

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`)
})

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    )
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  const { commandName } = interaction
  await interaction.deferReply()

  if (commandName === 'add_tally_to') {
    const spaceName = interaction.options.getString('space')
    const user = interaction.options.getUser('target')
    const tally = new TallyService()

    const tallyName = await tally.getTallyNumberByUserName(user.username)
    const name = tallyName.name
    const count = tallyName.number
    if (name) {
      const tallyNumber = await tally.patchTallyNumber(count, user.username)
      return interaction.editReply(
        `Added 1 tally to ${user}. Total tally for member is now ${tallyNumber.tallyNumber}`
      )
    } else {
      return interaction.editReply(
        `${user} doesnt exist in the L-tally space would you like to add them ?`
      )
    }
  }

  if (!interaction.isChatInputCommand()) return
  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true
      })
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      })
    }
  }
})

// Log in to Discord with your client's token
client.login(token)

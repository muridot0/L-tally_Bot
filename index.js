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
const {AuthService} = require('./utils/auth-service')
const {TallyService} = require('./utils/TallyService')
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
  let authToken = null
  await interaction.deferReply()

  if (commandName === 'add_tally_to') {
    const strategy = 'login'
    const username = 'notgr_server'
    const password = 'P@ssword123'
    const spaceName = interaction.options.getString('space')
    const userName = interaction.options.getUser('target')
    const login = new AuthService()
    const tally = new TallyService(userName.username)

    try {

      // const res = await login.getToken()
      const res = await tally.getTallyByUserName()
      console.log(res.data)
      // authToken = res.token
      // if (authToken !== null) {
      //   try {
      //     const headers = {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${authToken}`
      //     }
      //     let getSpaceName = await axios.get(
      //       `https://api.muri-o.com/space?spaceName=${spaceName}`,
      //       { headers: headers}
      //     )
      //     const res = await getSpaceName.data
      //     console.log(res, userName)
      //     // return getSpaceName.body.json()
      //   } catch (err) {
      //     const { response } = err
      //     return interaction.editReply(`${response.data.message}`)
      //   }
      // }
      return interaction.editReply('added')
    } catch (err) {
      const { response } = err
      return interaction.editReply(err)
      // console.log(err.response.data.message)
    }

    // if (authToken) {

    // }
    // try {
    //   const login = await axios.post('https://api.muri-o.com/authentication', {strategy, username, password})
    //   // const login = await request('https://api.muri-o.com/authentication', {
    //   //   method: 'POST',
    //   //   headers: {'Content-Type': 'application/json'},
    //   //   body: {
    //   //     "strategy": "login",
    //   //     "username": "notgr_server",
    //   //     "password": "P@ssword123"
    //   //   }
    //   // })
    //   const data = await login.body.json()
    //   console.log(login)
    // } catch {
    //   // handle errors here
    // }
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

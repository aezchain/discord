require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  Events,
  REST,
  Routes
} = require('discord.js');

// Create a new client instance with ONLY the Guilds intent
// This should work without requiring any privileged intents
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds
  ] 
});

// Define role options with emojis and colors
const roleOptions = [
  {
    name: 'Tweets',
    description: 'Engage with our tweets to earn points!',
    value: 'Tweets',
    roleId: process.env.TWEETS_ROLE_ID,
    color: ButtonStyle.Primary, // Blue
    confirmMessage: 'You now have the Raider role!'
  },
  {
    name: 'Games',
    description: 'Join community games and compete with others!',
    value: 'Games',
    roleId: process.env.GAMES_ROLE_ID,
    color: ButtonStyle.Success, // Green
    confirmMessage: 'You now have the Gamer Monalien role!'
  },
  {
    name: 'Giveaways',
    description: "Don't miss a chance to win in our giveaways!",
    value: 'Giveaways',
    roleId: process.env.GIVEAWAYS_ROLE_ID,
    color: ButtonStyle.Danger, // Red
    confirmMessage: 'You now have the Giveaway role!'
  }
];

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Register slash command to create/update the role message
  await registerCommands();
  
  // Check if the roles message already exists
  await setupRolesMessage();
});

// Register slash commands
async function registerCommands() {
  const commands = [
    {
      name: 'setup-roles',
      description: 'Set up the roles message in the current channel'
    }
  ];

  try {
    console.log('Started refreshing application (/) commands.');
    
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }
}

// Setup the roles message
async function setupRolesMessage() {
  try {
    const channelId = process.env.CHANNEL_ID;
    if (!channelId) {
      console.log('No channel ID set in .env file');
      return;
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.log(`Channel with ID ${channelId} not found`);
      return;
    }

    // Create the embed
    const embed = createRolesEmbed();
    
    // Create the buttons
    const buttonRow = createRoleButtons();
    
    // Try to fetch existing messages from the bot
    const messages = await channel.messages.fetch({ limit: 10 });
    const existingMessage = messages.find(m => 
      m.author.id === client.user.id && 
      m.embeds.length > 0 && 
      m.embeds[0].title === 'What do you want to be notified about?'
    );

    if (existingMessage) {
      // Update the existing message
      await existingMessage.edit({ embeds: [embed], components: [buttonRow] });
      console.log('Updated existing roles message');
    } else {
      // Send a new message
      await channel.send({ embeds: [embed], components: [buttonRow] });
      console.log('Created new roles message');
    }
  } catch (error) {
    console.error('Error setting up roles message:', error);
  }
}

// Create the embed for roles
function createRolesEmbed() {
  const embed = new EmbedBuilder()
    .setColor('#2B2D31')
    .setTitle('What do you want to be notified about?');
  
  // Add fields for each role
  roleOptions.forEach(role => {
    embed.addFields({
      name: `${role.name}`,
      value: role.description
    });
  });
  
  return embed;
}

// Create the buttons for roles
function createRoleButtons() {
  const buttonRow = new ActionRowBuilder();
  
  roleOptions.forEach(role => {
    const button = new ButtonBuilder()
      .setCustomId(`role-${role.value}`)
      .setLabel(role.value)
      .setStyle(role.color);
    
    buttonRow.addComponents(button);
  });
  
  return buttonRow;
}

// Handle interactions
client.on(Events.InteractionCreate, async interaction => {
  // Handle slash commands
  if (interaction.isCommand()) {
    if (interaction.commandName === 'setup-roles') {
      // Check if the user has admin permissions
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({ 
          content: 'You need admin permissions to use this command.', 
          ephemeral: true 
        });
        return;
      }
      
      // Setup the roles message
      await setupRolesMessage();
      
      await interaction.reply({ 
        content: 'Roles message has been setup in this channel.', 
        ephemeral: true 
      });
    }
  }
  
  // Handle button interactions
  if (interaction.isButton()) {
    // Check if it's a role button
    if (interaction.customId.startsWith('role-')) {
      const roleValue = interaction.customId.replace('role-', '');
      const roleOption = roleOptions.find(r => r.value === roleValue);
      
      if (!roleOption) return;
      
      const member = interaction.member;
      
      try {
        const role = interaction.guild.roles.cache.get(roleOption.roleId);
        
        if (!role) {
          console.log(`Role with ID ${roleOption.roleId} not found!`);
          await interaction.reply({ 
            content: `Error: Role not found. Please contact an admin.`, 
            ephemeral: true 
          });
          return;
        }
        
        // Toggle the role
        if (member.roles.cache.has(role.id)) {
          await member.roles.remove(role);
          await interaction.reply({ 
            content: `You no longer have the <@&${role.id}> role.`, 
            ephemeral: true 
          });
        } else {
          await member.roles.add(role);
          await interaction.reply({ 
            content: `${roleOption.confirmMessage} <@&${role.id}>`, 
            ephemeral: true 
          });
        }
      } catch (error) {
        console.error(`Error managing role ${roleOption.name}:`, error);
        await interaction.reply({ 
          content: 'An error occurred while managing your role. Please try again later.', 
          ephemeral: true 
        });
      }
    }
  }
});

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN); 
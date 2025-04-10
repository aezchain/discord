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

// Create a new client instance with the necessary intents
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildInvites // Add this intent for invite tracking
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
    confirmMessage: 'You now have the Giveaways role!'
  }
];

// Define invite tracking constants
const SPECIAL_INVITE_CODE = 'uWTYxBK'; // Original invite code
const MAX_SPECIAL_USES = 50; // Maximum number of users to get the special role
const SPECIAL_ROLE_ID = '1358906307788406784'; // Monaliens OG role ID

// Define role swap configuration
const ROLE_SWAP_CONFIG = {
  triggerRoleId: process.env.TRIGGER_ROLE_ID || '1358826605706744100', // Role that triggers the swap when added
  removeRoleId: process.env.REMOVE_ROLE_ID || '1359518753926152365',  // Role to remove
  addRoleId: process.env.ADD_ROLE_ID || '1358511994616942817'      // Role to add
};

// Cache to track invite usage
let cachedInvites = new Map(); // { inviteCode: uses }

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Fetch initial invites for the guild
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const invites = await guild.invites.fetch();
    
    invites.forEach((invite) => {
      cachedInvites.set(invite.code, invite.uses);
      console.log(`Cached invite: ${invite.code} with ${invite.uses} uses`);
    });
    
    console.log('All invites cached successfully');
  } catch (error) {
    console.error('Error fetching initial invites:', error);
  }
  
  // Register slash command to create/update the role message
  await registerCommands();
  
  // Check if the roles message already exists
  await setupRolesMessage();
  
  // Send the warning message
  await sendWarningMessage();
});

// Track role changes to perform silent role swaps
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    // Check if the trigger role was added (wasn't there before but is now)
    const hadTriggerRole = oldMember.roles.cache.has(ROLE_SWAP_CONFIG.triggerRoleId);
    const hasTriggerRole = newMember.roles.cache.has(ROLE_SWAP_CONFIG.triggerRoleId);
    
    // If the trigger role was just added
    if (!hadTriggerRole && hasTriggerRole) {
      console.log(`Trigger role was added to ${newMember.user.tag}, performing silent role swap`);
      
      // Check if member has the role that should be removed
      if (newMember.roles.cache.has(ROLE_SWAP_CONFIG.removeRoleId)) {
        // Remove the specified role
        await newMember.roles.remove(ROLE_SWAP_CONFIG.removeRoleId)
          .catch(error => console.error(`Failed to remove role: ${error}`));
        console.log(`Silently removed role ${ROLE_SWAP_CONFIG.removeRoleId} from ${newMember.user.tag}`);
        
        // Check if the user already has the role to add
        if (newMember.roles.cache.has(ROLE_SWAP_CONFIG.addRoleId)) {
          console.log(`User ${newMember.user.tag} already has the role ${ROLE_SWAP_CONFIG.addRoleId}, no need to add it`);
        } else {
          // Add the new role
          await newMember.roles.add(ROLE_SWAP_CONFIG.addRoleId)
            .catch(error => console.error(`Failed to add role: ${error}`));
          console.log(`Silently added role ${ROLE_SWAP_CONFIG.addRoleId} to ${newMember.user.tag}`);
        }
      }
    }
  } catch (error) {
    console.error('Error in role swap process:', error);
  }
});

// Track new members joining and check which invite they used
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    // Fetch the current invites
    const newInvites = await member.guild.invites.fetch();
    
    // Find which invite was used
    const usedInvite = newInvites.find((invite) => {
      // Check if we have this invite cached
      const cachedUses = cachedInvites.get(invite.code);
      // If cached uses is undefined or less than current uses, this invite was used
      return cachedUses !== undefined && cachedUses < invite.uses;
    });
    
    // Update the cached invites
    newInvites.forEach(invite => cachedInvites.set(invite.code, invite.uses));
    
    // If we found the used invite and it's our special one
    if (usedInvite && usedInvite.code === SPECIAL_INVITE_CODE) {
      console.log(`User ${member.user.tag} joined using the special invite!`);
      
      // Check if this user is within the first 50
      if (usedInvite.uses <= MAX_SPECIAL_USES) {
        // Assign the special role
        try {
          await member.roles.add(SPECIAL_ROLE_ID);
          console.log(`Assigned Monaliens OG role to ${member.user.tag} - They were #${usedInvite.uses} to use the invite`);
        } catch (error) {
          console.error('Error assigning special role:', error);
        }
      } else {
        console.log(`User ${member.user.tag} joined with the special invite but it's already been used more than ${MAX_SPECIAL_USES} times`);
      }
    } else {
      console.log(`User ${member.user.tag} joined but we couldn't determine which invite they used`);
    }
  } catch (error) {
    console.error('Error handling new member:', error);
  }
});

// Register slash commands
async function registerCommands() {
  const commands = [
    {
      name: 'setup-roles',
      description: 'Set up the roles message in the current channel'
    },
    {
      name: 'send-warning',
      description: 'Send the warning message with official links'
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

// Send warning message with official links
async function sendWarningMessage() {
  try {
    const warningChannelId = process.env.WARNING_CHANNEL_ID || '1338276001448202300';
    
    const channel = await client.channels.fetch(warningChannelId);
    if (!channel) {
      console.log(`Warning channel with ID ${warningChannelId} not found`);
      return;
    }

    // Create the embed for the warning message
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('DO NOT INTERACT WITH ANY OTHER LINKS')
      .addFields(
        { name: 'X', value: 'https://x.com/monaliens', inline: false },
        { name: 'Website', value: 'https://monaliens.xyz/', inline: false }
      );
    
    // If you want to add an image, uncomment this line and replace the URL
    // embed.setImage('https://your-image-url-here.jpg');
    
    // Send the message
    await channel.send({ embeds: [embed] });
    console.log('Sent warning message');
    
    // Non-embed alternative (use this if you want the # symbol to render as a heading)
    /*
    await channel.send({ 
      content: '# DO NOT INTERACT WITH ANY OTHER LINKS\n\nX:  https://x.com/monaliens\nWebsite: https://monaliens.xyz/' 
    });
    */
  } catch (error) {
    console.error('Error sending warning message:', error);
  }
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
    else if (interaction.commandName === 'send-warning') {
      // Check if the user has admin permissions
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        await interaction.reply({ 
          content: 'You need admin permissions to use this command.', 
          ephemeral: true 
        });
        return;
      }
      
      // Send the warning message
      await sendWarningMessage();
      
      await interaction.reply({ 
        content: 'Warning message has been sent.', 
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
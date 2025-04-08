# Discord Role Assignment Bot

A Discord bot that lets users select which types of notifications they want to receive by assigning Discord roles.

## Features

- Users can choose from three notification types:
  - Tweets: Engage with our tweets to earn points!
  - Games: Join community games and compete with others!
  - Giveaways: Don't miss a chance to win in our giveaways!
- Roles are assigned when selected and removed when deselected
- Clean UI with buttons for each role option

## How It Works

The bot creates an embed message asking "What do you want to be notified about?" with three button options. When users click the buttons, they toggle the corresponding role on their profile.

## Setup

1. **Create a Discord Bot**
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Navigate to the "Bot" tab and click "Add Bot"
   - No privileged intents are required for this bot
   - Copy your bot token (click "Reset Token" if you need a new one)
   - **IMPORTANT**: You must use a real bot token in the .env file or you'll get a "TokenInvalid" error

2. **Invite the Bot to Your Server**
   - In the Developer Portal, go to the "OAuth2" > "URL Generator" tab
   - Select the "bot" and "applications.commands" scopes
   - Select the following permissions:
     - Manage Roles
     - Send Messages
     - Read Messages/View Channels
     - Embed Links
   - Copy the generated URL and open it in your browser to add the bot to your server

3. **Create Roles in Discord**
   - Create the following roles in your Discord server:
     - Tweets
     - Games
     - Giveaways
   - Make sure your bot's role is positioned higher than these roles in the role hierarchy

4. **Configure Environment Variables**
   - Rename the `.env.example` file to `.env`
   - Add your bot token, guild ID, and role IDs to the `.env` file:
     ```
     BOT_TOKEN=your_discord_bot_token_here
     GUILD_ID=your_guild_id_here
     CHANNEL_ID=your_channel_id_here
     TWEETS_ROLE_ID=your_tweets_role_id
     GAMES_ROLE_ID=your_games_role_id
     GIVEAWAYS_ROLE_ID=your_giveaways_role_id
     ```

5. **Install Dependencies**
   ```
   npm install
   ```

6. **Start the Bot**
   ```
   npm start
   ```

## Usage

### Setting Up the Roles Message

1. Create a channel where you want the role selection message to appear
2. Make sure the bot has permission to send messages and embed links in that channel
3. Navigate to the desired channel and run the command:
   ```
   /setup-roles
   ```
4. The bot will create or update a role selection message in that channel

### Selecting Roles

Users can select roles by clicking on the buttons below the role message:
- Click a button to add that role
- Click a button again to remove that role
- Users get a private confirmation when roles are added or removed

## Requirements

- Node.js v16.9.0 or higher
- Discord.js v14

## Troubleshooting

- If roles aren't being assigned:
  - Check that the bot has the "Manage Roles" permission
  - Ensure the bot's role is higher than the roles it needs to assign
  - Verify that the role IDs in the `.env` file are correct

- If the roles message doesn't appear:
  - Check that the CHANNEL_ID is set correctly in the `.env` file
  - Make sure the bot has permissions to send messages and embeds in that channel

- If buttons don't work:
  - Restart the bot to ensure it's properly connected to Discord's gateway
  - Check the console for any error messages 
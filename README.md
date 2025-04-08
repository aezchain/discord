
<<<<<<< HEAD
A Discord bot that lets users select which types of notifications they want to receive by assigning Discord roles.

## Features

- Users can choose from three notification types:
  - Tweets: Engage with our tweets to earn points!
  - Games: Join community games and compete with others!
  - Giveaways: Don't miss a chance to win in our giveaways!
- Roles are assigned when selected and removed when deselected
- Clean UI with buttons for each role option
- Warning message with official links can be sent to a designated channel
- Special "Monaliens OG" role automatically assigned to the first 50 users who join using a specific invite link

## How It Works

The bot creates an embed message asking "What do you want to be notified about?" with three button options. When users click the buttons, they toggle the corresponding role on their profile.

### Invite Tracking System

- The bot tracks uses of a specific invite link (discord.gg/uWTYxBK)
- The first 50 users who join with this link automatically receive the "Monaliens OG" role
- The bot caches invite counts to determine which invite was used by a new member
- Detailed logging is provided to track invite usage and role assignments

## Setup

1. **Create a Discord Bot**
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Navigate to the "Bot" tab and click "Add Bot"
   - Under the "Privileged Gateway Intents" section, enable:
     - SERVER MEMBERS INTENT
     - GUILD INVITES INTENT
   - Copy your bot token (click "Reset Token" if you need a new one)
   - **IMPORTANT**: You must use a real bot token in the .env file or you'll get a "TokenInvalid" error

2. **Invite the Bot to Your Server**
   - In the Developer Portal, go to the "OAuth2" > "URL Generator" tab
   - Select the "bot" and "applications.commands" scopes
   - Select the following permissions:
     - Manage Roles
     - Manage Guild (for invite tracking)
     - Send Messages
     - Read Messages/View Channels
     - Embed Links
   - Copy the generated URL and open it in your browser to add the bot to your server

3. **Create Roles in Discord**
   - Create the following roles in your Discord server:
     - Tweets
     - Games
     - Giveaways
     - Monaliens OG (for the first 50 users)
   - Make sure your bot's role is positioned higher than these roles in the role hierarchy

4. **Create or Note Your Special Invite Link**
   - Create an invite link in your server: discord.gg/uWTYxBK
   - This will be the tracked invite for assigning the Monaliens OG role

5. **Configure Environment Variables**
   - Rename the `.env.example` file to `.env`
   - Add your bot token, guild ID, and role IDs to the `.env` file:
     ```
     BOT_TOKEN=your_discord_bot_token_here
     GUILD_ID=your_guild_id_here
     CHANNEL_ID=your_channel_id_here
     WARNING_CHANNEL_ID=your_warning_channel_id_here
     TWEETS_ROLE_ID=your_tweets_role_id_here
     GAMES_ROLE_ID=your_games_role_id_here
     GIVEAWAYS_ROLE_ID=your_giveaways_role_id_here
     SPECIAL_INVITE_CODE=uWTYxBK
     SPECIAL_ROLE_ID=your_monaliens_og_role_id_here
     ```

6. **Install Dependencies**
   ```
   npm install
   ```

7. **Start the Bot**
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

### Sending the Warning Message

1. The bot automatically sends a warning message with official links when it starts up
2. You can also manually trigger this message using the command:
   ```
   /send-warning
   ```
3. This message includes links to your official X account and website
4. To add an image to this message, uncomment and modify the appropriate line in the `sendWarningMessage` function

### Selecting Roles

Users can select roles by clicking on the buttons below the role message:
- Click a button to add that role
- Click a button again to remove that role
- Users get a private confirmation when roles are added or removed

### Invite Tracking

- The bot automatically tracks which invite link new members use
- If they use the special invite link (discord.gg/uWTYxBK), and are among the first 50 users, they get the Monaliens OG role
- No user interaction is required for this feature - it happens automatically when they join

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

- If invite tracking isn't working:
  - Ensure the bot has the "Manage Guild" permission
  - Check that the invite code in the .env file matches your actual invite code
  - Verify that the bot has the GUILD_INVITES intent enabled 
=======
>>>>>>> d8307ca91a201c25139a24a1670df2fc47aaf616

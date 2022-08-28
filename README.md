# How to set up

- Install node 16.14.0 and npm

- run `npm i` in your terminal

- create a .env file in the root of the project

- create a bot in the discord developer portal

- set all needed permissions to true

- add botToken (the bot's token),
  guildId (not necessary, locally registers command),

  environment (not necessary, sets the environment),

  mongooseConnectionString ((string from mongoDB to connect) not necessary but is recommended for the use of a lot of commands),

  webhookLogLink (not necessary, recommended to get the error alerts),

  developerId (not necessary, recommended to avoid permission issues),

  hypixelapikey (not necessary, used for commands that require the hypixel api),

  githubToken (not necessary, recommended for crashlog reader and automod)

  botprefix (currently needed)

- either run `npm run build` and `npm run start:prod` or `npm run quickstart`

# features

## events

linkReader =>

**needs**: manage webhooks or Administrator permission

![action](https://cdn.discordapp.com/attachments/903281241594413176/931176014925688852/unknown.png)

action: when a message is sent that contains a discord message link, it will send the message through a webhook

roleLinked =>

**needs**: manage roles or Administrator permission

![action](https://cdn.discordapp.com/attachments/903281241594413176/931176550748016720/unknown.png)

action: when a trigger role is removed from a user and they don't have any bypass roles / other trigger roles they will get their linked roles removed

## commands

reload =>

**needs**: manage roles or Administrator permission

![action](https://cdn.discordapp.com/attachments/903281241594413176/931176923520966656/unknown.png)

action: runs the server's configuration of the roleLinked event

disable =>

**needs**: none

![action](https://cdn.discordapp.com/attachments/903281241594413176/931177873308540978/unknown.png)

action: disable a command or event from working in the guild it's executed in

configuration =>

**needs**: manage roles

**action**: modify or see the configuration of the guild it's executed in

ticket =>

**needs**: manage threads, and use threads

**action**: create, modify or delete a ticket message, add people to threads, block people from speaking in threads or even close a thread

hypixel api =>

**needs**: none

**action**: get information from the hypixel api or verify yourself in the bot's user database

timeout =>

**needs**: moderate members

**action**: use the discord timeout feature to timeout a user

role =>

**needs**: manage roles

**action**: gives or removes a role from the target

tag =>

**needs**: none

**action**: create a guild only command that responds with a specified message

echo =>

**needs**: none

**action**: sends a message in a channel or send a message to a user

botInfo =>

**needs**: none

**action**: gives information about the bot and it's commands

# contribute

follow [How to set up](#how-to-set-up) and once you finish your changes,
create a pull-request (I might not see it directly as I am generally busy)

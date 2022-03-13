# Botcynx Typescript v1.7.1

the old [javascript version](https://github.com/ascynx-betas/botcynx-js) was created in october of 2021
and was mostly coded by me @Ascynx,

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

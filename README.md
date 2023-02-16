<p align="center">
  <img src="https://img.shields.io/github/stars/ascynx-betas/botcynx-typescript?colorA=363a4f&colorB=b7bdf8&style=for-the-badge">
  <img src="https://img.shields.io/tokei/lines/github/ascynx-betas/botcynx-typescript?style=for-the-badge">
</p>

# How to set up

- Install node 16.14.0 or higher and npm

- run the command `npm i` in your terminal

- create a bot in the discord developer portal

- set all needed permissions to true

- create a .env file in the root of the project

- Fill the [.env variables](https://github.com/ascynx-betas/botcynx-typescript/blob/main/example-env), be it using a .env file or from any other sources

- either run `npm run build` and `npm run start:prod` or `npm run quickstart`

# features

## events

linkReader =>

**needs**: manage webhooks or Administrator permission

![image](https://user-images.githubusercontent.com/78341107/197343383-cdd31b09-edb3-4ae6-b00d-49f7b03ef870.png)

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
# 

<p align="center">
  <img src="https://img.shields.io/github/license/ascynx-betas/botcynx-typescript?colorA=363a4f&colorB=yellow&style=for-the-badge">
</p>
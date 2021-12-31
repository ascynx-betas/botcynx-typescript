import process from 'process';
import { botcynx } from '..';
import * as d from '../personal-modules/discordPlugin'
import * as mp from '../personal-modules/testFor'

process.on("unhandledRejection", async (error: Error) => {
    let stack = error.stack;
    let fields = stack.split("\n");
    stack = fields[0] + "\n" + fields[1] + "\n" + fields[2];
    
    const time = mp.getTimeOfDay();
    const err = "[" + time + "]" + " Unhandled promise rejection: " + stack;
  
    console.log(err)
  
    const info = d.webhook(process.env.webhookLogLink);
    if (!info) return;
  
    return botcynx.fetchWebhook(info.id, info.token).then((webhook) =>
      webhook.send({
        content: `${err}`,
        username: `${botcynx.user?.tag || "preloading Error"}`,
        avatarURL: botcynx.user?.displayAvatarURL({ dynamic: true }),
      })
    );
  });
  
  process.on("uncaughtException", async (error: Error) => {
    let stack = error.stack;
    let fields = stack.split("\n");
    stack = fields[0] + "\n" + fields[1] + "\n" + fields[2];
  
    const time = mp.getTimeOfDay();
    const err = "[" + time + "]" + " Unhandled Exception " + stack;
    console.log(err)
    const info = d.webhook(process.env.webhookLogLink);
    if (!info) return;
    return botcynx.fetchWebhook(info.id, info.token).then((webhook) =>
      webhook.send({
        content: `${err}`,
        username: `${botcynx.user?.tag || "preloading Error"}`,
        avatarURL: botcynx.user?.displayAvatarURL({ dynamic: true }),
      })
    );
  });
  
  process.on("rejectionHandled", async (error: Error) => {
    let stack = error.stack;
    let fields = stack.split("\n");
    stack = fields[0] + "\n" + fields[1] + "\n" + fields[2];

    const time = mp.getTimeOfDay();
    const err = "[" + time + "]" + " handled promise rejection " + stack;
    console.log(err)
    const info = d.webhook(process.env.webhookLogLink);
    if (!info) return;
  
    return botcynx.fetchWebhook(info.id, info.token).then((webhook) =>
      webhook.send({
        content: `${err}`,
        username: `${botcynx.user?.tag || "preloading Error"}`,
        avatarURL: botcynx.user?.displayAvatarURL({ dynamic: true }),
      })
    );
  });
  
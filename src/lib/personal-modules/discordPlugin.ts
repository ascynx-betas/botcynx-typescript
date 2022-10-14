import {
  APIEmbedField,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
} from "discord.js";
import { botcynx } from "../..";
import { snowflake } from "../../typings/Client";

const permOverride = async function (permissionlist: any) {
  if (typeof permissionlist !== "object")
    throw `TypeError: cannot read ${typeof permissionlist}`;
  if (!permissionlist) throw `TypeError: Missing variable`;

  let permlist = [];
  let denied = [];
  let allowed = [];

  permissionlist.forEach(function (permissionlist) {
    if (permissionlist.type === "member") {
      permlist.push(`<@${permissionlist.id}>`);
      denied.push(permissionlist.deny.bitfield);
      allowed.push(permissionlist.allow.bitfield);
    }
  });
  let result = { permlist: permlist, denied: denied, allowed: allowed };
  return result;
};
const isId = function (potentialId: string) {
  let allowed = /^[0-9]+$/g;
  let test = /[^[0-9]/gi;
  if (typeof potentialId !== "string") return Error(`is not a String`);
  let atest = potentialId.replace(test, "");
  potentialId = atest;
  if (potentialId.length > 19) return false;

  if (!allowed.test(potentialId)) return false;
  return true;
};
const isInvite = function (potentialInvite: string) {
  if (typeof potentialInvite !== "string") return Error(`is not a string`);
  let invite =
    /.discord\.gg\/.+$|.discord\.com\/invite\/.+$|.discordapp\.com\/+$/gim;
  if (!invite.test(potentialInvite)) return false;
  return true;
};
const webhook = function (webhooklink: string) {
  let link = webhooklink;
  link = link.slice(8, link.length);
  let fields = link.split("/");
  if (fields[2] != "webhooks") return;
  const wbtoken = fields[4];
  const wbid = fields[3];
  return { id: wbid, token: wbtoken };
};

const snowflakeToMention = function (array: Array<string>, type: snowflake) {
  let result: any[] = [];
  if (type === "USER") {
    array.forEach(function (string) {
      if (string != "") {
        string = `<@${string}>`;
        result.push(string);
      }
    });
  } else if (type === "CHANNEL") {
    array.forEach(function (string) {
      if (string != "") {
        string = `<#${string}>`;
        result.push(string);
      }
    });
  } else if (type === "ROLE") {
    array.forEach(function (string) {
      if (string != "") {
        string = `<@&${string}>`;
        result.push(string);
      }
    });
  }
  return result;
};

const setActiveButton = function (buttonId: string, arrayOfCustomIds: string[]): ButtonStyle[] {
  let styles: ButtonStyle[] = [];

  for (let i = 0; i < arrayOfCustomIds.length; i++) {
    styles[i] = (buttonId == arrayOfCustomIds[i] ? ButtonStyle.Primary : ButtonStyle.Secondary);
  }

  return styles;
}

const MaxButtonPerRow = 5;

const setButtonRows = function (buttons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder>[] {
  let components: ActionRowBuilder<ButtonBuilder>[] = [];
  if (buttons && buttons.length < 1) throw new Error("Provide a non-empty array.");


  for (let i = 0; i < buttons.length; i++) {
    let currentRowIndex = Math.floor(i / 5);
    let currentButtonIndex = (i % MaxButtonPerRow);
    if (currentRowIndex > 4) throw new Error("Too many buttons for creation.");

    if (currentButtonIndex == 0) {
      //create new component array
      components[currentRowIndex] = new ActionRowBuilder<ButtonBuilder>();
    }
    components[currentRowIndex].addComponents(buttons[i]);
  }
  return components;
}

const infoEmbedCreation = function (category: string) {
  const commands = botcynx.ArrayOfSlashCommands.concat(botcynx.commands)
    .filter((c: any) => c.category === category)
    .map((c: any) => c.name);
  const descriptions = botcynx.ArrayOfSlashCommands.concat(botcynx.commands)
    .filter((c: any) => c.category === category)
    .map((c: any) => c.description || (c as any).usage || "not defined");
  let fields: APIEmbedField[] = [];
  for (let i: number = 0; i < commands.length; i++) {
    let field: APIEmbedField = { name: ``, value: `` };
    let id = botcynx.application.commands.cache
      .filter((c) => c.name == commands[i])
      .first();
    field.name =
      id !== undefined ? "</" + commands[i] + ":" + id + ">" : commands[i];
    field.value = descriptions[i];
    fields.push(field);
  }

  let title = category;
  return { title, fields };
};

export {
  webhook,
  isId,
  isInvite,
  permOverride,
  snowflakeToMention,
  setButtonRows,
  infoEmbedCreation,
  setActiveButton
};

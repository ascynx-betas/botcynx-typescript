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

const SetActiveButton = async function (
  buttonId: string,
  arrayOfCustomId: string[]
): Promise<ButtonStyle[]> {
  let arrOfStyles: ButtonStyle[] = [];
  arrayOfCustomId.forEach(function (customId, index) {
    if (buttonId == customId) {
      arrOfStyles[index] = ButtonStyle.Primary;
    } else arrOfStyles[index] = ButtonStyle.Secondary;
  });
  return arrOfStyles;
};
const setButtonRows = async function (
  arrayOfButtons: ButtonBuilder[]
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
  let arrayOfComponents: ActionRowBuilder<ButtonBuilder>[] = [];
  if (arrayOfButtons.length > 1) {
    let component: ActionRowBuilder<ButtonBuilder> =
      new ActionRowBuilder<ButtonBuilder>();
    for (let i = 0; i < 5; i++) {
      component.addComponents(arrayOfButtons[i]);
      if (typeof arrayOfButtons[i + 1] == "undefined") break;
    }
    arrayOfComponents.push(component);
  }
  if (arrayOfButtons.length > 5) {
    let component = new ActionRowBuilder<ButtonBuilder>();
    for (let i = 5; i < 10; i++) {
      if (typeof arrayOfButtons[i] == "undefined") break;
      component.addComponents(arrayOfButtons[i]);
    }
    arrayOfComponents.push(component);
  }
  if (arrayOfButtons.length > 10) {
    let component = new ActionRowBuilder<ButtonBuilder>();
    for (let i = 10; i < 15; i++) {
      if (typeof arrayOfButtons[i] == "undefined") break;
      component.addComponents(arrayOfButtons[i]);
    }
    arrayOfComponents.push(component);
  }
  if (arrayOfButtons.length > 15) {
    let component = new ActionRowBuilder<ButtonBuilder>();
    for (let i = 15; i < 20; i++) {
      if (typeof arrayOfButtons[i] == "undefined") break;
      component.addComponents(arrayOfButtons[i]);
    }
    arrayOfComponents.push(component);
  }
  if (arrayOfButtons.length > 20) {
    let component = new ActionRowBuilder<ButtonBuilder>();
    for (let i = 20; i < 25; i++) {
      if (typeof arrayOfButtons[i] == "undefined") break;
      component.addComponents(arrayOfButtons[i]);
    }
    arrayOfComponents.push(component);
  }
  return arrayOfComponents;
};

const infoEmbedCreation = function (category: string) {
  const commands = botcynx.ArrayOfSlashCommands.concat(botcynx.commands)
    .filter((c: any) => c.category === category)
    .map((c: any) => c.name);
  const descriptions = botcynx.ArrayOfSlashCommands.concat(botcynx.commands)
    .filter((c: any) => c.category === category)
    .map((c: any) => c.description || "not defined");
  let fields: APIEmbedField[] = [];
  for (let i: number = 0; i < commands.length; i++) {
    let field: APIEmbedField = { name: ``, value: `` };
    field.name = commands[i];
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
  SetActiveButton,
  setButtonRows,
  infoEmbedCreation,
};

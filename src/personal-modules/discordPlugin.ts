import { MessageButtonStyleResolvable } from "discord.js";
import { snowflake } from "../typings/Client";

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
    if (potentialId.length != 18) return false;
  
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

  const snowflakeToMention = function(array: Array<string>, type: snowflake) {
    let result: any[] = [];
    if (type === "USER") {
        array.forEach(function (string) {
            if (string != "") {
                string = `<@${string}>`;
                result.push(string);
            }
        })
    } else if (type === "CHANNEL") {
        array.forEach(function (string) {
            if (string != "") {
                string = `<#${string}>`;
                result.push(string);
            }
        })
    } else if (type === "ROLE") {
        array.forEach(function (string){
            if (string != "") {
                string = `<@&${string}>`;
                result.push(string);
            }
        })
    }
    return result;
}

const SetActiveButton = async function(activeButton: string, arrayOfCustomId: string[]): Promise<MessageButtonStyleResolvable[]> {
  let arrOfStyles: MessageButtonStyleResolvable[] = [];
  arrayOfCustomId.forEach(function (customId, index) {
    let result: boolean;
    let fields = customId.split(' ');
    fields.forEach(function (field) {
      if (field == activeButton) {
        return result = true;
      }
    })
    if (result == true) {
      arrOfStyles[index] = "SUCCESS"
    } else arrOfStyles[index] = "SECONDARY"
  })
  return arrOfStyles;
}

  export { webhook, isId, isInvite, permOverride, snowflakeToMention, SetActiveButton };
  
import {
  APIEmbedField,
  ButtonBuilder,
  EmbedBuilder,
  Embed,
  ButtonStyle,
  APIEmbed,
  User,
  Message,
  GuildTextBasedChannel,
  ActionRowBuilder,
  TextBasedChannel,
  Guild,
} from "discord.js";
import { botcynx } from "..";
import { getWebhook } from "./personal-modules/discordPlugin";
import { emojis } from "./emojis";
import { checkLink } from "../events/linkReader";
import { RepoProfile, RepositoryCacheHandler } from "./cache/repoCache";
import { configModel } from "../models/config";
import { CommandType, UserContextType, MessageContextType, CommandSimili, MessageCommandType } from "../typings/Command";

// Source : https://lowrey.me/encoding-decoding-base-62-in-es6-javascript/
export const base62 = {
  charset: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  encode: (integer: number) => {
    if (integer === 0) {
      return 0;
    }
    let s = [];
    while (integer > 0) {
      s = [base62.charset[integer % 62], ...s];
      integer = Math.floor(integer / 62);
    }
    return s.join('');
  },
  decode: (chars: string) => chars.split('').reverse()
    .reduce((prev, curr, i) => prev + (base62.charset.indexOf(curr) * (62 ** i)), 0)
};
//

/**
 * @returns the likelyhood of a word trying to "impersonate" another word (used in an automod to check what is possibly a scam link)
 * @author Ascynx
 */
export const similarityDetectionShortened = (word: string, testWord: string): {result: boolean; percentage: number } => {
  const similarityArray: boolean[] = [];

  for (let i = 0; i < testWord.length; i++) {
    similarityArray.push(word.length > i && testWord[i] == word[i]);
  }

  let likelyhood = (100 / similarityArray.length) * similarityArray.filter((e) => e).length;
  const overflowLength = word.length - testWord.length;

  if (overflowLength >= 1) {
    likelyhood -= (overflowLength * 5);//remove 5% per extra character
  }

  if (likelyhood < 0) {
    likelyhood = 0;
  }

  //if it's above 95% it's likely it is a typo, if it's under 60% it's quite unlikely for it to be a scam link
  return {result: (likelyhood <= 95 && likelyhood > 60), percentage: likelyhood};
};

export const similarityDetection = (
  word: string,
  testWord: string
): { result: boolean; percentage: number } => {
  const testWordLength = testWord.length;
  const wordLength = word.length;
  let testLetterArray: string[] = [];
  let LetterArray: string[] = [];
  let similarityArray: boolean[] = [];

  for (let i = 0; i < testWordLength; i++) {
    testLetterArray[i] = testWord[i];
  }
  for (let i = 0; i < wordLength; i++) {
    LetterArray[i] = word[i];
  }

  testLetterArray.forEach((testLetter, i) => {
    if (LetterArray[i] == testLetter) similarityArray.push(true);
    else similarityArray.push(false);
  });

  const isTrue = similarityArray.filter((b) => b);
  let percentageOfSimilarities = (100 / similarityArray.length) * isTrue.length;

  const overflowLettersLength = LetterArray.length - testLetterArray.length;
  //What is that supposed to accomplish?
  if (overflowLettersLength >= 1) {
    if ((testLetterArray.length - overflowLettersLength) * 5 > 0) percentageOfSimilarities = percentageOfSimilarities - (testLetterArray.length - overflowLettersLength) * 5;
    if (percentageOfSimilarities < 0) percentageOfSimilarities = 0;
  }

  if (percentageOfSimilarities <= 95 && percentageOfSimilarities > 0)
    return { result: true, percentage: percentageOfSimilarities };
  else return { result: false, percentage: percentageOfSimilarities };
};

export const returnEditQueryButton = (page = 0, maxPage = 1, query: string) => {
  let backwardButton = new ButtonBuilder().setCustomId(`querypage:${query}:${(page - 1)}`).setEmoji("◀️").setStyle(ButtonStyle.Primary);
  let editButton = new ButtonBuilder().setCustomId("newquery:" + query).setLabel("New query").setStyle(ButtonStyle.Secondary);
  let forwardButton = new ButtonBuilder().setCustomId(`querypage:${query}:${(page + 1)}`).setEmoji("▶️").setStyle(ButtonStyle.Primary);
  if (page == 0) {
    backwardButton.setDisabled(true);
  }
  if ((page + 1) >= maxPage) {
    forwardButton.setDisabled(true);
  }

  return new ActionRowBuilder<ButtonBuilder>().addComponents([
    backwardButton,
    editButton,
    forwardButton
  ]);
}

export const queryEmbed = (tag: string, query: string, page = 0) => {
  if (!RepositoryCacheHandler.INSTANCE.hasQuery(query)) throw Error("Query is not registered!");
  let queryData = RepositoryCacheHandler.INSTANCE.getQuery(query);
  let items: RepoProfile[] = queryData.getPage(page);

  let fields: APIEmbedField[] = [];
  let buttonFields: ButtonBuilder[] = [];

  items.forEach((item) => {
    fields.push({
      name: `${item.owner}/${item.name} - ${item.stars} ⭐ - ${item.forks} ${emojis.fork}`,
      value: `${item.description}`,
    });
    buttonFields.push(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(item.repoURL)
        .setLabel(item.name)
    );
  });

  const embed = new EmbedBuilder()
    .setTitle(
      `${items.length === 1 ? `${items[0].name}` : `results for ${query}`} ${page != 0 ? ` - page ${page + 1}` : ""}`
    )
    .setFields(fields)
    .setFooter({ text: `requested by ${tag} - ${queryData.total_count} results - ${Math.floor(queryData.total_count / 5)} page${queryData.total_count / 5 > 2 ? "s" : "" }` });

  return { embed, buttonFields };
};

export const sendInfoWebhook = async (options: {
  message?: string;
  embed?: Embed | APIEmbed;
}) => {
  const { message, embed } = options;
  const webhook = getWebhook(process.env.webhookLogLink);

  (await botcynx.fetchWebhook(webhook.id, webhook.token)).send({
    content: message != null ? message : null,
    embeds: embed != null ? [embed] : null,
    allowedMentions: { parse: ["roles", "users"] },
    username: botcynx.user.tag,
    avatarURL: botcynx.user.avatarURL({ forceStatic: false }),
  });
};

const usernameToOldFormat = (username: string): string => {
  if (username.endsWith("#0")) {
    //new format (tag returns username#0)
    return username += "000";
  } else {
    //old format (still username#discriminator)
    return username;
  }
};

export const checkHypixelLinked = (user: User, linked: String): boolean => (linked?.toLowerCase() == usernameToOldFormat(user.tag.toLowerCase()));

const linkRegex =
  /((?:(https:\/\/)|(http:\/\/)|())(?<host>.{0,6})\.)?discord\.com\/channels\/(?<guild>[0-9]+)\/(?<channel>[0-9]+)\/(?<message>[0-9]+)(\/.*)?/im;

export async function getMessage(link: string): Promise<Message<boolean>> {
  if (!checkLink(link.replace(/(https:\/\/)|(http:\/\/)/, ""))) {
    return null;
  }

  linkRegex.lastIndex = 0;
  let match = linkRegex.exec(link);
  if (match["groups"] != null && match["groups"] != undefined) {
    let guild = match["groups"].guild;
    if (
      botcynx.guilds.cache.get(guild) == null ||
      botcynx.guilds.cache.get(guild) == undefined
    ) {
      return null;
    }

    let channel = match["groups"].channel;
    let message = match["groups"].message;

    let Message = await (
      botcynx.channels.cache.get(channel) as GuildTextBasedChannel
    ).messages.fetch(message);
    return Message;
  } else {
    return null;
  }
}

export const permissionTranslate = {
  CREATE_INSTANT_INVITE: "CreateInstantInvite",
  KICK_MEMBERS: "KickMembers",
  BAN_MEMBERS: "BanMembers",
  ADMINISTRATOR: "Administrator",
  MANAGE_CHANNELS: "ManageChannels",
  MANAGE_GUILD: "ManageGuild",
  ADD_REACTIONS: "AddReactions",
  VIEW_AUDIT_LOG: "ViewAuditLog",
  PRIORITY_SPEAKER: "PrioritySpeaker",
  STREAM: "Stream",
  VIEW_CHANNEL: "ViewChannel",
  SEND_MESSAGES: "SendMessages",
  SEND_TTS_MESSAGES: "SendTTSMessages",
  MANAGE_MESSAGES: "ManageMessages",
  EMBED_LINKS: "EmbedLinks",
  ATTACH_FILES: "AttachFiles",
  READ_MESSAGE_HISTORY: "ReadMessageHistory",
  MENTION_EVERYONE: "MentionEveryone",
  USE_EXTERNAL_EMOJIS: "UseExternalEmojis",
  VIEW_GUILD_INSIGHTS: "ViewGuildInsights",
  CONNECT: "Connect",
  SPEAK: "Speak",
  MUTE_MEMBERS: "MuteMembers",
  DEAFEN_MEMBERS: "DeafenMembers",
  MOVE_MEMBERS: "MoveMembers",
  USE_VAD: "UseVAD",
  CHANGE_NICKNAME: "ChangeNickname",
  MANAGE_NICKNAMES: "ManageNicknames",
  MANAGE_ROLES: "ManageRoles",
  MANAGE_WEBHOOKS: "ManageWebhooks",
  MANAGE_EMOJIS_AND_STICKERS: "ManageEmojisAndStickers",
  USE_APPLICATION_COMMANDS: "UseApplicationCommands",
  REQUEST_TO_SPEAK: "RequestToSpeak",
  MANAGE_EVENTS: "ManageEvents",
  MANAGE_THREADS: "ManageThreads",
  CREATE_PUBLIC_THREADS: "CreatePublicThreads",
  CREATE_PRIVATE_THREADS: "CreatePrivateThreads",
  USE_EXTERNAL_STICKERS: "UseExternalStickers",
  SEND_MESSAGES_IN_THREADS: "SendMessagesInThreads",
  USE_EMBEDDED_ACTIVITIES: "UseEmbeddedActivities",
  MODERATE_MEMBERS: "ModerateMembers",
};

class Enum {
  //------ Instances ------//

  //------ Static Methods ------//

  static get values(): Enum[] {
    return [];
  }

  /**
   * Converts a string to its corresponding Enum instance.
   *
   * @param string the string to convert to Enum
   * @throws RangeError, if a string that has no corressonding Enum value was passed.
   * @returns the matching Enum
   */
  static fromString(string: string): Enum {
    // Works assuming the name property of the enum is identical to the variable's name.
    const value = (this as any)[string];
    if (value) {
      return value;
    }

    throw new RangeError(
      `Illegal argument passed to fromString(): ${string} does not correspond to any instance of the enum ${
        (this as any).prototype.constructor.name
      }`
    );
  }

  //------ Constructor------//

  private constructor(
   /**
    * The name of the instance; should be exactly the variable name,
    * for serializing/deserializing simplicity.
    */
    public readonly name: string
  ) {}

  //------ Methods ------//

  /**
   * Called when converting the Enum value to a string using JSON.Stringify.
   * Compare to the fromString() method, which deserializes the object.
   */
  public toJSON() {
    return this.name;
  }

  public toString() {
    return this.toJSON();
  }
}

export function sendToServerLog(logchannel: string, embed: Embed | EmbedBuilder) {
  if (logchannel != null && embed != null) {
    return (botcynx.channels.cache.get(logchannel) as TextBasedChannel).send({
      allowedMentions: {parse: []},
      embeds: [embed]
    });
  }
}
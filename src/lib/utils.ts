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
} from "discord.js";
import { botcynx } from "..";
import { webhook } from "./personal-modules/discordPlugin";
import { emojis } from "./emojis";
import { checkLink } from "../events/linkReader";
import { RepoProfile } from "./cache/repoCache";

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
  if (overflowLettersLength >= 1) {
    if ((testLetterArray.length - overflowLettersLength) * 5 > 0)
      percentageOfSimilarities =
        percentageOfSimilarities -
        (testLetterArray.length - overflowLettersLength) * 5;
    if (percentageOfSimilarities < 0) percentageOfSimilarities = 0;
  }

  if (percentageOfSimilarities <= 95 && percentageOfSimilarities > 0)
    return { result: true, percentage: percentageOfSimilarities };
  else return { result: false, percentage: percentageOfSimilarities };
};

export const returnEditQueryButton = (page = 0, maxPage = 1) => {
  let backwardButton = new ButtonBuilder().setCustomId("querypage:" + (page - 1)).setEmoji("◀️").setStyle(ButtonStyle.Primary);
  let editButton = new ButtonBuilder().setCustomId("newquery").setLabel("New query").setStyle(ButtonStyle.Secondary);
  let forwardButton = new ButtonBuilder().setCustomId("querypage:" + (page + 1)).setEmoji("▶️").setStyle(ButtonStyle.Primary);
  if (page == 0) {
    backwardButton.setDisabled(true);
  }
  if (page == maxPage) {
    forwardButton.setDisabled(true);
  }

  return new ActionRowBuilder<ButtonBuilder>().addComponents([
    backwardButton,
    editButton,
    forwardButton
  ]);
}

export const queryEmbed = (data, tag, query, page = 0) => {
  let pageFirstElement = (page*5) > 0 ? (page*5)-1 : (page*5);
  if (data.total_count >= 5) data.items = data.items.slice(pageFirstElement, pageFirstElement + 5);
  //expected result (if page = 0 return 5 first elements, else return page * 5 as first element and 5 later as max)

  let items: RepoProfile[] = [];
  data.items.forEach((item: RepoItem) => {
    items.push(new RepoProfile(item));
  });

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
      `${items.length === 1 ? `${items[0].name}` : `results for ${query}`}`
    )
    .setFields(fields)
    .setFooter({ text: `requested by ${tag} - ${data.total_count} results` });

  return { embed, buttonFields };
};

export const sendInfoWebhook = async (options: {
  message?: string;
  embed?: Embed | APIEmbed;
}) => {
  const { message, embed } = options;
  const infoWebhook = webhook(process.env.webhookLogLink);

  (await botcynx.fetchWebhook(infoWebhook.id, infoWebhook.token)).send({
    content: message != null ? message : null,
    embeds: embed != null ? [embed] : null,
    allowedMentions: { parse: ["roles", "users"] },
    username: botcynx.user.tag,
    avatarURL: botcynx.user.avatarURL({ forceStatic: false }),
  });
};

export function checkHypixelLinked(user: User, linked: String): boolean {
  let tag = user.tag;

  if (
    linked == tag ||
    linked == tag.toLowerCase() ||
    linked == tag.toUpperCase()
  ) {
    return true;
  }

  return false;
}

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

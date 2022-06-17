import { EmbedFieldData, ButtonBuilder, EmbedBuilder, Embed, ButtonStyle, APIEmbed } from "discord.js";
import { botcynx } from "..";
import { webhook } from "../personal-modules/discordPlugin";
import { fork } from "./emojis";

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

export const queryEmbed = (data, tag, query) => {
  if (data.total_count >= 5) data.items = data.items.slice(0, 5);

  let items: {
    name: string;
    owner: string;
    description: string;
    repoURL: string;
    stars: number;
    forks: number;
  }[] = [];
  data.items.forEach((item) => {
    let description: string;
    if (item.description?.length <= 200) description = item.description;
    else if (item.description?.length >= 200) {
      description = item.description.slice(0, 196) + "... ";
    } else description = "no description set";

    let name = item.name;
    let owner = item.owner.login;
    let repoURL = item.html_url;
    let stargazers = item.stargazers_count;
    let forks = item.forks_count;

    items.push({
      description: description,
      name: name,
      owner: owner,
      repoURL: repoURL,
      stars: stargazers,
      forks: forks,
    });
  });

  let fields: EmbedFieldData[] = [];
  let buttonFields: ButtonBuilder[] = [];

  items.forEach((item) => {
    fields.push({
      name: `${item.owner}/${item.name} - ${item.stars} ⭐ - ${item.forks} ${fork}`,
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
    .setFooter({ text: `requested by ${tag}` });

  return { embed, buttonFields }; //not sure how it's gonna work out
};

export const sendInfoWebhook = async (options: {
  message?: string;
  embed?: Embed | APIEmbed;
}) => {
  const { message, embed } = options;
  const infoWebhook = webhook(process.env.webhookLogLink);
  const hook = await botcynx.fetchWebhook(infoWebhook.id, infoWebhook.token);
  hook.send({
    content: message != null ? message : null,
    embeds: embed != null ? [embed] : null,
    allowedMentions: { parse: ["roles", "users"] },
    username: botcynx.user.tag,
    avatarURL: botcynx.user.avatarURL({ forceStatic: false }),
  });
};

export const permissionTranslate = {
  "CREATE_INSTANT_INVITE": "CreateInstantInvite",
  "KICK_MEMBERS": "KickMembers",
  "BAN_MEMBERS": "BanMembers",
  "ADMINISTRATOR": "Administrator",
  "MANAGE_CHANNELS": "ManageChannels",
  "MANAGE_GUILD": "ManageGuild",
  "ADD_REACTIONS": "AddReactions",
  "VIEW_AUDIT_LOG": "ViewAuditLog",
  "PRIORITY_SPEAKER": "PrioritySpeaker",
  "STREAM": "Stream",
  "VIEW_CHANNEL": "ViewChannel",
  "SEND_MESSAGES": "SendMessages",
  "SEND_TTS_MESSAGES": "SendTTSMessages",
  "MANAGE_MESSAGES": "ManageMessages",
  "EMBED_LINKS": "EmbedLinks",
  "ATTACH_FILES": "AttachFiles",
  "READ_MESSAGE_HISTORY": "ReadMessageHistory",
  "MENTION_EVERYONE": "MentionEveryone",
  "USE_EXTERNAL_EMOJIS": "UseExternalEmojis",
  "VIEW_GUILD_INSIGHTS": "ViewGuildInsights",
  "CONNECT": "Connect",
  "SPEAK": "Speak",
  "MUTE_MEMBERS": "MuteMembers",
  "DEAFEN_MEMBERS": "DeafenMembers",
  "MOVE_MEMBERS": "MoveMembers",
  "USE_VAD": "UseVAD",
  "CHANGE_NICKNAME": "ChangeNickname",
  "MANAGE_NICKNAMES": "ManageNicknames",
  "MANAGE_ROLES": "ManageRoles",
  "MANAGE_WEBHOOKS": "ManageWebhooks",
  "MANAGE_EMOJIS_AND_STICKERS": "ManageEmojisAndStickers",
  "USE_APPLICATION_COMMANDS": "UseApplicationCommands",
  "REQUEST_TO_SPEAK": "RequestToSpeak",
  "MANAGE_EVENTS": "ManageEvents",
  "MANAGE_THREADS": "ManageThreads",
  "CREATE_PUBLIC_THREADS": "CreatePublicThreads",
  "CREATE_PRIVATE_THREADS": "CreatePrivateThreads",
  "USE_EXTERNAL_STICKERS": "UseExternalStickers",
  "SEND_MESSAGES_IN_THREADS": "SendMessagesInThreads",
  "USE_EMBEDDED_ACTIVITIES": "UseEmbeddedActivities",
  "MODERATE_MEMBERS": "ModerateMembers"
};
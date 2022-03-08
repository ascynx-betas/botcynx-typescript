import { Embed } from "@discordjs/builders";
import { EmbedFieldData, MessageButton, MessageEmbed } from "discord.js";
import { botcynx } from "..";
import { webhook } from "../personal-modules/discordPlugin";
import { fork } from "./emojis";

export const timestampToHuman = (timestamp: number): string => {
  let data = { time: timestamp, type: "timestamp" };
  data = { time: timestamp / 1000, type: "seconds" };
  if (data.time >= 60) data = { time: data.time / 60, type: "minutes" };
  if (data.time >= 60) data = { time: data.time / 60, type: "hours" };
  if (data.time >= 24) data = { time: data.time / 24, type: "days" };
  if (data.time >= 7) data = { time: data.time / 7, type: "weeks" };
  if (data.time >= 4) data = { time: data.time / 4, type: "months" };
  data.time = Math.round(data.time * 10) / 10; //round number to decimal

  return `${data.time} ${data.type}`;
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
  if (overflowLettersLength >= 1) {
    if ((testLetterArray.length - overflowLettersLength) * 5 > 0)
      percentageOfSimilarities =
        percentageOfSimilarities -
        (testLetterArray.length - overflowLettersLength) * 5;
    if (percentageOfSimilarities > 0) percentageOfSimilarities = 0;
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
      item.description = item.description.slice(0, 200);
      description = item.description + "... ";
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
  let buttonFields: MessageButton[] = [];

  items.forEach((item) => {
    fields.push({
      name: `${item.owner}/${item.name} - ${item.stars} ⭐ - ${item.forks} ${fork}`,
      value: `${item.description}`,
    });
    buttonFields.push(
      new MessageButton()
        .setStyle("LINK")
        .setURL(item.repoURL)
        .setLabel(item.name)
    );
  });

  const embed = new MessageEmbed()
    .setTitle(
      `${items.length === 1 ? `${items[0].name}` : `results for ${query}`}`
    )
    .setFields(fields)
    .setFooter({ text: `requested by ${tag}` });

  return { embed, buttonFields }; //not sure how it's gonna work out
};

export const sendInfoWebhook = async (message?: string, embed?: Embed) => {
  const infoWebhook = webhook(process.env.webhookLogLink);
  const hook = await botcynx.fetchWebhook(infoWebhook.id, infoWebhook.token);
  hook.send({
    content: message != null ? message : null,
    embeds: embed != null ? [embed] : null,
    allowedMentions: { parse: ["roles", "users"] },
    username: botcynx.user.tag,
    avatarURL: botcynx.user.avatarURL({ dynamic: true }),
  });
};

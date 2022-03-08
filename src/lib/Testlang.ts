import { Collection } from "discord.js";
import { repoLink } from "./cache/cache";
import { jsonCache } from "./cache/crashFix";

//export const TestLang = new jsonCache(new repoLink("Ascynx", "botcynx-data", "lang.json")); //Create lang.json

const testLangPlaceholder = {
  "en-us": {
    value: "whatever the frick it means",
  },
  fr: {
    value: "ce que ça veut dire mais en français",
  },
};

//then to access the value;

const getLangValue = (searchedValue: string) => {
  const CollectionOfValues: Collection<string, string> = new Collection();

  for (const lang in testLangPlaceholder) {
    //deprecated to update
    const language =
      Object.values(testLangPlaceholder)[
        Object.keys(testLangPlaceholder).indexOf(lang)
      ]; //deprecated to update

    for (const value in language) {
      if (value != searchedValue) continue;

      CollectionOfValues.set(
        lang,
        Object.values(language)[Object.keys(language).indexOf(value)]
      ); //very cool not overcomplicated thing
      //Example "en-us": "this is a test", "fr": "c'est un test"
    }
  }

  return CollectionOfValues; //then you can get with the localization the right value
};

//example of use
/**
 * I require to get the local value of confirmation then
 * const confirmation: string = getLangValue("confirmation").get(localization: string); //localization being what you get from slashCommands
 */

const addLangValue = (key: string, ENvalue: string): void => {
  const k = key;
  const addedValue = {};
  addedValue[k] = ENvalue;
  Object.assign(testLangPlaceholder["en-us"], addedValue); //deprecated to update
};

const getUpdaterFile = () => {
  const jsonLang = JSON.stringify(testLangPlaceholder); //deprecated to update
  const bufferLang = Buffer.from(jsonLang);

  return bufferLang;
};

export { getLangValue, addLangValue, getUpdaterFile };

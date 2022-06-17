import { Collection } from "discord.js";

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
    //deprecated to change testLangPlaceholder to TestLang when the cache is finished
    const language =
      Object.values(testLangPlaceholder)[
        Object.keys(testLangPlaceholder).indexOf(lang)
      ]; //deprecated to change testLangPlaceholder to TestLang when the cache is finished

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
  Object.assign(testLangPlaceholder["en-us"], addedValue); //deprecated to change testLangPlaceholder to TestLang when the cache is finished
  //TODO find a way to automate the translation in available languages
};

const getUpdaterFile = (): Buffer => {
  const jsonLang = JSON.stringify(testLangPlaceholder); //deprecated to change testLangPlaceholder to TestLang when the cache is finished
  const bufferLang = Buffer.from(jsonLang);

  return bufferLang;
};

export { getLangValue, addLangValue, getUpdaterFile };

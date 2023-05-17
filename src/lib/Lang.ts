import * as fs from "fs";
import { LogLevel, LoggerFactory } from "./Logger";

export interface Localization {
  [key: string]: LocalizedString;
}

export class LocalizedString {
  private langs: { [key: string]: string }; //language => value
  private modifiers: Function[] = [];

  constructor(strings: { [key: string]: string }) {
    this.langs = strings;
  }

  public editBase(locale: string, edit: string): LocalizedString {
    this.langs[locale.toLowerCase()] = edit;
    return this;
  }

  public insert(key: string, replace: string): LocalizedString {
    this.modifiers.push((string: string) => {
      return string.replace(`{${key}}`, replace);
    });
    return this;
  }

  public setMods(modifiers: Function[]) {
    this.modifiers = modifiers;
    return this;
  }

  public getWithoutMods(locale: string): string {
    if (this.langs[locale.toLowerCase()])
      return this.langs[locale.toLowerCase()];

    return this.langs["en-us"];
  }

  public get(locale: string) {
    let string = this.getWithoutMods(locale);

    for (const modifier of this.modifiers) {
      string = modifier(string);
    }
    this.setMods([]);

    return string;
  }

  public toString() {
    return this.langs.toString();
  }
}

export class LocalizationHandler {
  private cache: Localization;
  private static INSTANCE: LocalizationHandler = new LocalizationHandler();
  private logger = LoggerFactory.getLogger("LOCALIZATION-HANDLER");
  constructor(cache?: Localization) {
    this.cache = cache ? cache : {};
  }

  public static getInstance() {
    return this.INSTANCE;
  }

  public getLang(key: string): LocalizedString {
    return this.cache[key];
  }

  public addKey(language: string, key: string, value: string) {
    if (this.cache[key]) {
      this.cache[key].editBase(language.toLowerCase(), value);
    } else {
      let object = {};
      object[language] = value;
      this.cache[key] = new LocalizedString(object);
    }
  }

  //just used to be more clear on the intent
  public editKey = this.addKey;

  public loadPlaceholder() {
    this.cache = {
      confirmation: new LocalizedString({
        "en-us": "Do you want to confirm {action} ?",
        fr: "Est-ce que vous voulez confirmer {action} ?",
      }),
      delete: new LocalizedString({
        "en-us": "Do you want to delete {item} ?",
        fr: "Voulez vous supprimer {item} ?",
      }),
    };
  }

  public load(): LocalizationHandler {
    this.logger.log("Started Loading", LogLevel.DEBUG);
    let path = process.cwd() + "/lang";
    for (let dir of fs.readdirSync(path)) {
      let object = JSON.parse(
        fs.readFileSync(path + "/" + dir, { encoding: "utf-8" })
      );
      for (let key in object) {
        let v = object[key];
        this.addKey(dir.split(".")[0], key, v);
      }
    }
    this.logger.log("Finished Loading", LogLevel.DEBUG);
    return this;
  }

  //convenience methods
  toBuffer(): Buffer {
    return Buffer.from(this.toJSON());
  };

  toJSON(): string {
    return JSON.stringify(this.cache, null, 2);
  };

  fromJSON(LocaleJson: string): LocalizationHandler {//deserialize
    this.cache = JSON.parse(LocaleJson);
    return this;
  };
}

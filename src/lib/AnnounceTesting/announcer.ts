import { Message } from "discord.js";
import { handleAnnouncement } from "./listeners";

export class Announcer {
  name: string;
  channelId: string;
  LISTENERS: Listener[];
  isDisabled: boolean;

  constructor(name: string, channelId: string, isDisabled = false) {
    this.name = name;
    this.channelId = channelId;
    this.isDisabled = isDisabled;
    this.LISTENERS = [];
  }

  addListener(listener: Listener) {
    this.LISTENERS.push(listener);
    return this;
  }

  removeListener(index?: number, name?: string) {
    if (index == undefined && name == undefined)
      throw new Error("Missing Listener name or Listener index");
    if (index != undefined) {
      if (this.LISTENERS.length < index)
        throw new Error("Listener does not exist");
      this.LISTENERS.slice(index, 1);
    } else {
      if (!this.LISTENERS.some((listener) => listener.LISTENER_NAME == name))
        throw new Error("Listener does not exist");

      this.LISTENERS.forEach((listener, index) => {
        if (listener.LISTENER_NAME == name) delete this.LISTENERS[index];
      });
    }

    return this;
  }

  setDisabled(boolean: boolean) {
    this.isDisabled = boolean;
    return this;
  }
}

export class Announcers {
  /**
   * - The announcers stored
   */
  Announcers: Announcer[];

  constructor(announcers: Announcer[]) {
    this.Announcers = announcers;
  }

  /**
   *
   * @returns {String[]} - The list of channels monitored
   */
  getIds() {
    return this.Announcers.map((a) => a.channelId);
  }

  addAnnouncer(announcerToAdd: Announcer) {
    if (
      this.Announcers.some((announcer) => announcer.name == announcerToAdd.name)
    )
      return;

    this.Announcers.push(announcerToAdd);
    return this;
  }

  /**
   *
   * @param name - The name of the announcer you want to get;
   * @returns {Announcer} - the announcer that it found
   */
  getAnnouncer(name: string) {
    if (!this.Announcers.some((Announcer) => Announcer.name == name))
      throw Error("No announcer of that name exists");
    let sAnnouncer: Announcer;

    this.Announcers.forEach((announcer) => {
      if (announcer.name == name) sAnnouncer = announcer;
    });

    return sAnnouncer;
  }

  /**
   *
   * @param channelId - The channel that's monitored (ID);
   * @returns {Array<Announcer>} - returns the list of announcers that monitor that ID;
   */
  getAnnouncerById(channelId: string) {
    if (!this.Announcers.some((Announcer) => Announcer.channelId == channelId))
      throw Error("No announcers with that channel monitored");
    let sAnnouncers: Announcer[] = [];

    this.Announcers.forEach((Announcer) => {
      if (Announcer.channelId == channelId) sAnnouncers.push(Announcer);
    });

    return sAnnouncers;
  }
}

export interface preference {
  method: "REPLACE" | "DISABLE" | "IDENTITY";
  original?: string;
  replaced_value?: string;
  type?: "ANONYMOUS" | "USER" | "SERVER-USER";
}

export class Listener {
  LISTENER_NAME: string;
  webhookLogLink: string;
  PREFERENCES: preference[];

  constructor(name: string, webhook: string) {
    this.LISTENER_NAME = name;
    this.webhookLogLink = webhook;
    this.PREFERENCES = [];
  }

  addPreference(options: preference) {
    if (options.method == "DISABLE")
      this.PREFERENCES.push({ method: "DISABLE" });
    else if (options.method == "REPLACE")
      this.PREFERENCES.push({
        method: "REPLACE",
        original: options.original,
        replaced_value: options.replaced_value,
      });
    else if (options.method == "IDENTITY")
      this.PREFERENCES.push({
        method: "IDENTITY",
        type: options.type,
      });

    return this;
  }

  getListener() {
    return this;
  }

  removePreference(index: number) {
    this.PREFERENCES.splice(index, 1);
    return this;
  }
}

export const handleMessageAnnouncement = async (message: Message) => {
  if (message.author.bot || message.author.system) return;
  const announcer: Announcer = new Announcer(
    "skill issue",
    "895619966877962240"
  )
    .addListener(
      new Listener("testing listener", "")
        .addPreference({
          method: "REPLACE",
          original: "<@!?376647579653636096>",
          replaced_value: "bot owner ping",
        })
        .addPreference({
          method: "REPLACE",
          original: "dangerous",
          replaced_value: "totally safe",
        })
        .addPreference({
          method: "IDENTITY",
          type: "USER",
        })
    )
    .addListener(new Listener("LISTENER2", ""));
  const otherAnnouncer: Announcer = new Announcer(
    "amogus",
    "893864038554017793"
  ).addListener(
    new Listener("1st listener", "")
      .addPreference({ method: "REPLACE", original: "skill issue" })
      .addPreference({ method: "IDENTITY", type: "SERVER-USER" })
  );

  let announcers = new Announcers([announcer, otherAnnouncer]);

  if (!announcers.getIds().includes(message.channelId)) return;
  let selectedAnnouncer = announcers.getAnnouncerById(message.channelId)[0];

  handleAnnouncement(message, selectedAnnouncer);
};

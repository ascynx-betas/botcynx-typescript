import { ClientEvents, Message } from "discord.js";
import { botcynxInteraction } from "../typings/Command";

export class Event<Key extends keyof extendedClientEvents> {
  constructor(
    public event: Key,
    public run: (...args: extendedClientEvents[Key]) => any
  ) {}
}

export interface extendedClientEvents extends ClientEvents {
  interactioncommandCreate: [interaction: botcynxInteraction];
  messageCommandCreate: [message: Message];
  finishedLoading: any;
} //add custom events here

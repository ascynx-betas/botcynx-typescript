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

export interface HypixelAPIEvents {
  reset: [data: {lastReset: number, APICallsLastMinute: number, ReachedMax: boolean, activityLog: {[key: string]: number}}];
  rateLimit: [data: {eventType: "server" | "client"}];
  serverRateLimit: [data: {}];
  clientRateLimit: [data: {}];
  invalidAPIKey: [data: undefined];
}
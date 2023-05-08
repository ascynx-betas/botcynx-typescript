import {
  Collection,
  Message,
  MessageEditOptions,
  MessagePayload,
  MessageReplyOptions,
} from "discord.js";
import { MessageCommandType } from "../typings/Command";
import { LoggerFactory } from "./Logger";

class RequestError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class RequestHandler {
  private requests: Collection<string, Request>;

  private static instance: RequestHandler;

  private constructor() {
    this.requests = new Collection();
  }

  static getInstance() {
    if (!this.instance) this.instance = new RequestHandler();
    return this.instance;
  }

  GetOrCreateRequest(message: Message<boolean>) {
    if (!this.requests.get(message.id)) {
      let request = new Request(message);
      this.requests.set(message.id, request);
      return request;
    } else {
      return this.requests.get(message.id);
    }
  }

  createRequest(message: Message<boolean>, command?: MessageCommandType) {
    if (!this.requests.get(message.id)) {
      let request = new Request(message, command);
      this.requests.set(message.id, request);
      return request;
    } else {
      throw new RequestError("Message already has a request linked to it");
    }
  }

  getRequest(message: Message<boolean>) {
    if (this.requests.get(message.id)) {
      this.requests.get(message.id).getFlags();
      return this.requests.get(message.id);
    } else
      throw new RequestError("Message doesn't have a request linked to it");
  }

  contains(message: Message<boolean>) {
    return this.requests.get(message.id) != null;
  }

  deleteRequest(messageId: string) {
    if (!this.requests.get(messageId)) {
      throw new RequestError("Message doesn't exist in list");
    } else {
      LoggerFactory.getLogger("RequestHandler").debug("Deleting request tied to "+messageId)
      this.requests.delete(messageId);
    }
  }
}

export class Request {
  private message: Message<boolean>;
  private response: Message<boolean>;
  private command: MessageCommandType;

  private usable: boolean;
  private flags: Flag[];

  constructor(message: Message<boolean>, command?: MessageCommandType) {
    this.message = message;
    this.usable = true;
    this.command = command;

    let advancedFlags = "";
    if (command.advancedFlags) {
      const index = message.content.split(" ").indexOf("--");

      if (index > 0) {
        advancedFlags = message.content.split(" ").filter((v, i) => i > index).join(" ");
      }
    }

    this.flags = !command.advancedFlags ? this.getFlags() : advancedFlags != "" ? this.getFlagsFrom(advancedFlags) : [];
  }

  async send(
    options: string | MessagePayload | MessageReplyOptions
  ): Promise<Message> {
    if (!this.usable)
      throw new RequestError(
        "This request was invalidated and cannot be responded to anymore."
      );
    if (!this.response) {
      let response = await this.message.reply(options);
      this.response = response;
      return response;
    } else {
      if (typeof options == "string") {
        return this.response.edit(options as string);
      } else if (options instanceof MessagePayload) {
        return this.response.edit(options);
      } else {
        return this.response.edit(options as MessageEditOptions);
      }
    }
  }

  getFlags(): Flag[] {
    let flags: Flag[] = this.getFlagsFrom(
      this.message.content.replace(process.env.botPrefix + " ", "")
      );
    this.flags = flags;
    return flags;
  }

  readonly flagMatch = /^--?\w+$/;

  getFlagsFrom(request: string): Flag[] {
    let flags: Flag[] = [];

    for (let arg of request.split(" ")) {
      if (this.flagMatch.test(arg)) {
        flags.push(new Flag(arg));
      }
    }

    return flags;
  }

  getNonFlagArgs(): string[] {
    let args: string[] = [];
    let foundEmptyArg = false;
    for (let arg of this.message.content.split(" ").slice(1)) {
      if (this.flagMatch.test(arg) && !this.command.advancedFlags) continue;
      if (foundEmptyArg) continue;
      if (this.command.advancedFlags) {
        if (arg.match("--$")) {
          foundEmptyArg = true;
          continue;
        }
      }
      args.push(arg);
    }
    return args;
  }

  hasFlag(possibleFlag: string) {
    for (let flag of this.flags) {
      let testFlag = this.flagMatch.test(possibleFlag)
        ? new Flag(possibleFlag)
        : new Flag((possibleFlag.length == 1 ? "-" : "--") + possibleFlag);

      if (testFlag.flagType == flag.flagType) {
        if (testFlag.toString() === flag.toString()) {
          return true;
        }
      } else if (
        testFlag.flagType == FlagType.LONG &&
        flag.flagType == FlagType.SHORT
      ) {
        if (testFlag.getShort() === flag.toString()) {
          return true;
        }
      }
    }

    return false;
  }

  async edit(
    options: string | MessagePayload | MessageEditOptions
  ): Promise<Message> {
    if (!this.usable)
      throw new RequestError(
        "This request was invalidated and cannot be responded to anymore."
      );
    if (!this.response) {
      throw new RequestError("Response doesn't exist, couldn't execute edit.");
    }
    return this.response.edit(options);
  }

  async delete(): Promise<boolean> {
    if (!this.usable)
      throw new RequestError(
        "This request was invalidated and cannot be responded to anymore."
      );
    if (!this.response) {
      throw new RequestError(
        "Response doesn't exist, couldn't execute deletion."
      );
    }
    if (this.response.deletable) {
      this.response.delete();
      this.response = undefined;
      return true;
    } else {
      throw new RequestError("Couldn't delete response.");
    }
  }

  invalidate() {
    if (!this.usable)
      throw new RequestError("This request was already invalidated");
    this.usable = false;
  }

  getMessage() {
    return this.message;
  }

  getResponse() {
    return this.response;
  }
}

class Flag {
  flagType: FlagType;
  flag: string;
  index?: number;

  constructor(flag: string) {
    if (!flag.startsWith("-")) throw new RequestError("Not a flag");
    if (flag[1] == "-") {
      this.flagType = FlagType.LONG;
    } else this.flagType = FlagType.SHORT;
    this.flag = this.flagType == FlagType.SHORT ? flag.slice(1) : flag.slice(2);
  }

  set setIndex(i: number) {
    this.index = i;
  }

  getShort() {
    if (this.flagType == FlagType.SHORT) return this.toString();
    return this.toString().substring(1, 2);
  }

  getLong() {
    if (this.flagType == FlagType.LONG) return this.toString();
    throw new RequestError("Cannot create long flag from short type");
  }

  toString() {
    return `${this.flagType == FlagType.SHORT ? "-" : "--"}${this.flag}`;
  }
}

export class FlagHandler {
  static getFlags(searchString: string): Collection<string, Flag> {
    let flags: Collection<string, Flag> = new Collection<string, Flag>();
    let args = searchString.split(" ");

    for (let i = 0; i < args.length; i++) {
      let arg = args[i];
      if (arg.startsWith("-")) {
        let flag = new Flag(arg);
        flag.setIndex = i;
        flags.set(arg.replaceAll("-", ""), flag);
      }
    }

    return flags;
  }

  static getNonFlagArgs(
    searchString: string
  ): { text: string; index: number }[] {
    let args: { text: string; index: number }[] = [];
    let as = searchString.split(" ");
    for (let i = 0; i < as.length; i++) {
      let arg = as[i];
      if (arg[0] == "-") continue;
      args.push({ text: arg, index: i });
    }
    return args;
  }

  static hasFlag(searchString: string, possibleFlag: string) {
    let flags = this.getFlags(searchString);
    for (let flagEntry of flags) {
      let flag = flagEntry[1];

      let testFlag = possibleFlag.startsWith("-")
        ? new Flag(possibleFlag)
        : new Flag((possibleFlag.length <= 3 ? "-" : "--") + possibleFlag);

      if (testFlag.flagType == flag.flagType) {
        if (testFlag.toString() === flag.toString()) {
          return true;
        }
      } else if (
        testFlag.flagType == FlagType.LONG &&
        flag.flagType == FlagType.SHORT
      ) {
        if (testFlag.getShort() === flag.toString()) {
          return true;
        }
      }
    }

    return false;
  }
}

enum FlagType {
  SHORT,
  LONG,
}

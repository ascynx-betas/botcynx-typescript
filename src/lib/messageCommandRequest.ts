import {
  Collection,
  Message,
  MessageEditOptions,
  MessagePayload,
  ReplyMessageOptions,
} from "discord.js";

export class RequestHandler {//broken in dms
  private List: Collection<string, request>;

  private static instance: RequestHandler;

  private constructor() {
    this.List = new Collection();
  }

  static getInstance() {
    if (!this.instance) this.instance = new RequestHandler();
    return this.instance;
  }

  GetOrCreateRequest(message: Message<boolean>) {
    if (!this.List.get(message.id)) {
      let req = new request(message);
      this.List.set(message.id, req);
      return req;
    } else {
      return this.List.get(message.id);
    }
  }

  createRequest(message: Message<boolean>) {
    if (!this.List.get(message.id)) {
        let req = new request(message);
        this.List.set(message.id, req);
        return req;
    } else {
        throw new Error("Message already has a request linked to it");
    }
  }

  getRequest(message: Message<boolean>) {
    if (this.List.get(message.id)) {
      this.List.get(message.id).getFlags();
        return this.List.get(message.id);
    } else throw new Error("Message doesn't have a request linked to it");
  }

  contains(message: Message<boolean>) {
    return this.List.get(message.id) != null;
  }

  deleteRequest(messageId: string) {
    if (!this.List.get(messageId)) {
      throw new Error("Message doesn't exist in list");
    } else {
      this.List.delete(messageId);
    }
  }
}

export class request {
  private message: Message<boolean>;
  private response: Message<boolean>;

  private usable: boolean;
  private flags: Flag[];


  constructor(request: Message<boolean>) {
    this.message = request;
    this.usable = true;
    this.flags = this.getFlags();
  }

  async send(
    options: string | MessagePayload | ReplyMessageOptions
  ): Promise<Message> {
    if (!this.usable)
      throw new Error(
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
    let flags: Flag[] = [];

    for (let arg of this.message.content.split(" ").slice(1)) {
      if (arg.startsWith("-")) {
        flags.push(new Flag(arg));
      }
    }

    this.flags = flags;
    return flags;
  }

  getNonFlagArgs(): string[] {
    let args: string[] = [];
    for (let arg of this.message.content.split(" ").slice(1)) {
      if (arg[0] == "-") continue;
      args.push(arg);
    }
    return args;
  }

  hasFlag(possibleFlag: string) {
    for (let flag of this.flags) {
        let testFlag = possibleFlag.startsWith("-") ?
         new Flag(possibleFlag) :
         new Flag((possibleFlag.length <= 3 ? "-" : "--") + possibleFlag);

        if (testFlag.flagType == flag.flagType) {
          if (testFlag.toString() === flag.toString()) {
            return true;
          }
        } else if (testFlag.flagType == FlagType.LONG && flag.flagType == FlagType.SHORT) {
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
      throw new Error(
        "This request was invalidated and cannot be responded to anymore."
      );
    if (!this.response) {
      throw new Error("Response doesn't exist, couldn't execute edit.");
    }
    return this.response.edit(options);
  }

  async delete(): Promise<boolean> {
    if (!this.usable)
      throw new Error(
        "This request was invalidated and cannot be responded to anymore."
      );
    if (!this.response) {
      throw new Error("Response doesn't exist, couldn't execute deletion.");
    }
    if (this.response.deletable) {
      this.response.delete();
      this.response = undefined;
      return true;
    } else {
      throw new Error("Couldn't delete response.");
    }
  }

  invalidate() {
    if (!this.usable) throw new Error("This request was already invalidated");
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
  
  constructor(flag: string) {
    if (!flag.startsWith("-")) throw new Error("Not a flag");
    if (flag[1] == "-") {
      this.flagType = FlagType.LONG;
    } else this.flagType = FlagType.SHORT;
    this.flag = this.flagType == FlagType.SHORT ? flag.slice(1) : flag.slice(2);
  }

  getShort() {
    if (this.flagType == FlagType.SHORT) return this.toString();
    return this.toString().substring(0, 3).slice(1);
  }

  getLong() {
    if (this.flagType == FlagType.LONG) return this.toString();
    throw new Error("Can't create a long flag from a short type :I");
  }

  toString() {
    return `${this.flagType == FlagType.SHORT ? "-" : "--"}${this.flag}`;
  }

}

enum FlagType {
  SHORT,
  LONG
}

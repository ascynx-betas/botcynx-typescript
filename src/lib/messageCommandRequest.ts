import {
  Collection,
  Message,
  MessageEditOptions,
  MessagePayload,
  ReplyMessageOptions,
} from "discord.js";

export class RequestHandler {
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

  constructor(request: Message<boolean>) {
    this.message = request;
    this.usable = true;
  }

  //content: string | MessageEditOptions | MessagePayload
  async send(
    options: string | MessagePayload | ReplyMessageOptions
  ): Promise<Message> {
    //reply -> will do the same as edit if response already exists
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

  async edit(
    options: string | MessagePayload | MessageEditOptions
  ): Promise<Message> {
    //edit -> gives error if #response doesn't exist
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
    //returns a boolean depending on whether it was able to delete the response or not.
    if (!this.usable)
      throw new Error(
        "This request was invalidated and cannot be responded to anymore."
      );
    if (!this.response) {
      throw new Error("Response doesn't exist, couldn't execute deletion.");
    }
    if (this.response.deletable) {
      this.response.delete();
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

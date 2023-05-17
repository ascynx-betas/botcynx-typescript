import { finishedLoading } from "../..";
import { LoggerFactory } from "../Logger";
import { linkContentPull } from "../repoPull";

const loadLoggerQueue: Cache[] = [];

export const loadAllCaches = async() => {
  for (let loader of loadLoggerQueue) {
    await loader.reload();
  }
  loadLoggerQueue.length = 0;
}

const logger = LoggerFactory.getLogger("CACHE");

export class Cache {
  data: any;
  reloader: string;

  constructor(link: string | RepoLink) {
    this.reloader = (link as RepoLink).repoLink || (link as string);
    if (!finishedLoading) {
      loadLoggerQueue.push(this);
    } else this.reload();
  }

  /**
   * Reloads the data stored
   */
  async reload() {
    logger.debug("Reloading cache");
    this.data = await linkContentPull(this.reloader);
  }
}

export class JsonCache extends Cache {
  constructor(link: string | RepoLink) {
    super(link);
  }

  /**
   * @override - overrides the base reload function from cache - and make it get JSON data instead of text
   */
  async reload() {
    try {
      logger.debug("Reloading cache " + this.reloader);
      this.data = JSON.parse(await linkContentPull(this.reloader));
    } catch (e) {
      logger.error(e);
    }
  }

  /**
   * - Import data into the current data cache (currently overrides data)
   * @param data - Data to import (currently overrides the internal data)
   */
  importData(data: any) {
    this.data = data;
  }
}

export class RepoLink {
  repoLink: string;
  #owner: string;
  #repo: string;
  #path: string;
  constructor(owner: string, repo: string, path: string) {
    this.repoLink = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    this.#owner = owner;
    this.#repo = repo;
    this.#path = path;
  }

  /**
   * Change the path of the repo
   * @param newPath - The path to change to
   */
  changePath(newPath: string) {
    this.#path = newPath;
    this.repoLink = `https://api.github.com/repos/${this.#owner}/${this.#repo}/contents/${newPath}`;

    return this;
  }

  /**
   * Reloads the repoLink
   */
  reloadLink() {
    this.repoLink = `https://api.github.com/repos/${this.#owner}/${this.#repo}/contents/${this.#path}`;

    return this;
  }
}

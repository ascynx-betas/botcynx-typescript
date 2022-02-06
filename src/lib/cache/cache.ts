import { linkContentPull } from "../repoPull";

export class cache {
  data;
  reloader: string;
  constructor(link: string | repoLink) {
    this.reloader = (link as repoLink).repoLink || (link as string);
    this.data = this.reload();
  }

  /**
   * Reloads the data stored
   */
  async reload() {
    this.data = await linkContentPull(this.reloader);
  }
}

export class repoLink {
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
    this.repoLink = `https://api.github.com/repos/${this.#owner}/${
      this.#repo
    }/${newPath}`;
  }

  /**
   * Reloads the repoLink
   */
  reloadLink() {
    this.repoLink = `https://api.github.com/repos/${this.#owner}/${
      this.#repo
    }/${this.#path}`;
  }
}

import fetch from "node-fetch";
import { botcynx } from "..";
type repoError = {
  code: number;
  cause: string;
};
class GitError extends Error {
  possibilities: object[];
  constructor(message: string, possibilities: object[]) {
    super(message);
    this.possibilities = possibilities;
  }
}
const gitFetchJson = async (url) => {
  const body = await fetch(url, {
    headers: { Authorization: `token ${process.env.githubToken}`, "user-agent": botcynx.getUserAgent() },
  });
  const json = await body.json();
  if (json.ok == false) {
    const err: repoError = {
      code: json.status,
      cause: json.statusText || "unknown",
    };
    return err;
  }
  if (json.message) {
    let err: repoError = { code: 404, cause: json.message };
    return err;
  }
  return json;
};

const repoInfoPull = async (owner: string, repo: string) => {
  let requestUrl = `https://api.github.com/repos/${owner}/${repo}`;

  return gitFetchJson(requestUrl);
};

/**
 * either owner, repo and path or link needs to be set for this function to run
 * @param owner - The owner of the repository
 * @param repo - The repository's name
 * @param path - The path of the file
 * @returns - An Error with the reason or the content of the file
 */
const repoContentPull = async (owner: string, repo: string, path: string) => {
  let requestUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const content = await gitFetchJson(requestUrl);
  if (content.code) {
    throw new Error(`${content.code} ${content.cause}`);
  }

  if (content.length > 1) {
    let types: string[] = [];
    let possibilities: object[] = [];
    content.forEach((dir) => {
      types.push(dir.type);
      possibilities.push({ name: dir.name, path: dir.path, type: dir.type });
    });
    throw new GitError(`${repo}${path} is a directory`, possibilities);
  } else {
    const toDecode = content.content;
    if (typeof toDecode == "undefined")
      throw new Error(`content of file does not exist`);

    const decoded = Buffer.from(toDecode, "base64");
    decoded.toString();

    return decoded.toString();
  }
};

const linkContentPull = async (link: string) => {
  let requestUrl = link;

  const content = await gitFetchJson(requestUrl);
  if (content.code) {
    throw new Error(`${content.code} ${content.cause}`);
  }

  if (content.length > 1) {
    let types: string[] = [];
    let possibilities: object[] = [];
    content.forEach((dir) => {
      types.push(dir.type);
      possibilities.push({ name: dir.name, path: dir.path, type: dir.type });
    });
    throw new GitError(`provided path is a directory`, possibilities);
  } else {
    const toDecode = content.content;
    if (typeof toDecode == "undefined")
      throw new Error(`content of file does not exist`);

    const decoded = Buffer.from(toDecode, "base64");
    decoded.toString();

    return decoded.toString();
  }
};

//search with name

const searchRepositories = async (query: string) => {
  let requestUrl = `https://api.github.com/search/repositories?q=${query}`;

  const data = await gitFetchJson(requestUrl);

  return data;
};

export {
  repoContentPull,
  repoInfoPull,
  gitFetchJson,
  linkContentPull,
  searchRepositories,
};

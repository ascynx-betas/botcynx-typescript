import fetch from "node-fetch";
import { botcynx } from "..";
type RepoError = {
  code: number;
  cause: string;
};

class GitError extends Error {
  localError: boolean;
  constructor(message: string, localError = false) {
    super(message);
    this.localError = localError;
  }

  public static from(repoError: RepoError, url?: string) {
    return new this(`Github api returned error ${repoError.code} with cause ${repoError.cause}${url ? ` on url ${url}` : ""}`, false);
  }
}

class GitContentError extends GitError {
  possibilities: object[];
  constructor(message: string, possibilities: object[], localError = false) {
    super(message, localError);
    this.possibilities = possibilities;
  }
}

/**
 * @throws {GitError}
 */
const gitFetchJson = async (url: string): Promise<any> => {
  const body = await fetch(url, {
    headers: {
      Authorization: `token ${process.env.githubToken}`,
      "user-agent": botcynx.userAgent,
    },
  });
  const json = await body.json();
  if (json.ok == false) {
    const err: RepoError = {
      code: json.status,
      cause: json.statusText || "unknown",
    };
    throw GitError.from(err, url);
  }
  if (json.message) {
    let err: RepoError = { code: 404, cause: json.message };
    throw GitError.from(err, url);
  }
  return json;
};

/**
 * @throws {GitError}
 */
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
 * @throws {GitError}
 */
const repoContentPull = async (owner: string, repo: string, path: string) => {
  let requestUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const content = await gitFetchJson(requestUrl);

  if (content.length > 1) {
    let types: string[] = [];
    let possibilities: object[] = [];
    content.forEach((dir) => {
      types.push(dir.type);
      possibilities.push({ name: dir.name, path: dir.path, type: dir.type });
    });
    throw new GitContentError(`${repo}${path} is a directory`, possibilities);
  } else {
    const toDecode = content.content;
    if (typeof toDecode == "undefined")
      throw new GitError(`content of file does not exist`, true);

    const decoded = Buffer.from(toDecode, "base64");
    decoded.toString();

    return decoded.toString();
  }
};

/** 
 * @throws {GitError}
*/
const linkContentPull = async (link: string) => {
  let requestUrl = link;

  const content = await gitFetchJson(requestUrl);

  if (content.length > 1) {
    let types: string[] = [];
    let possibilities: object[] = [];
    content.forEach((dir) => {
      types.push(dir.type);
      possibilities.push({ name: dir.name, path: dir.path, type: dir.type });
    });
    throw new GitContentError(`provided path is a directory`, possibilities);
  } else {
    const toDecode = content.content;
    if (typeof toDecode == "undefined")
      throw new GitError(`content of file does not exist`, true);

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

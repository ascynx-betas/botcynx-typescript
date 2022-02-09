import { searchRepositories } from "../repoPull";
searchRepositories(encodeURIComponent("botcynx")).then((data) =>
  console.log(data)
);
//stars at item.stargazers_count
//forks at item.forks_count
//last updated at item.updated_at //create updated timestamp then sort

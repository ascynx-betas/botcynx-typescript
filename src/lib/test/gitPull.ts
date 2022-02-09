import { searchRepositories } from "../repoPull";
searchRepositories(encodeURIComponent("botcynx-data")).then((data) => console.log(data));
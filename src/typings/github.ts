type githubItem = {
    id: number,
    node_id: string,
    url: string,
    html_url: string,
};
type RepoItem = {
    name: string,
    full_name: string,
    owner: owner,
    private: boolean,
    description: string,
    fork: boolean,
    created_at: string,
    updated_at: string,
    pushed_at: string,
    homepage: string,
    size: number,
    stargazers_count: number,
    watchers_count: number,
    language: string,
    forks_count: number,
    open_issues_count: number,
    master_branch: string,
    default_branch: string,
    score: number,
    forks: number,
    open_issues: number,
    watchers: number,
    has_issues: boolean,
    has_projects: boolean,
    has_pages: boolean,
    has_wiki: boolean,
    has_downloads: boolean,
    archived: boolean,
    disabled: boolean,
    visibility: "public" | "private",
    license: license

} & githubItem;
type owner = {
    login: string,
    type: "User" | "Org",
    events_url: string,
    site_admin: boolean
} & githubItem;
type license = {
    key: string,
    name: string,
    spdx_id: string,
} & githubItem;
export const unfunny = "";


type Possible = {
    key: string,
    possible_value: string, //parse with "|", declare types with SNAKECASE, () means not necessary
}


function accepts(value: string, possible_value_type: string): boolean {
    for (let possible of possible_value_type.split("|")) {
        if (possible === "STRING") {
            return true;
        } else if (possible === "NUMBER") {
            if (value.match(/^(>|<|>=|<=)\d*$/)) {
                return true;
            }
        } else if (possible === "DATE") {
            if (value.match(/^\d{4}-\d\d-\d\d(T\d\d:\d\d:\d\d\+\d\d:\d\d)?$/)) {//YYYY-MM-DD(THH:MM:SS+00:00)
                return true;
            }
        } else if (possible === "BOOLEAN") {
            if (["true", "false"].includes(value)) {
                return true;
            }
        } else {
            if (value === possible) {
                return true;
            }
        }
    }
    return false;
}

class QueryParser {
    private static githubAcceptedQueries: Possible[] = [
        {key: "in", possible_value: "name|description|topics|readme"},
        {key: "repo", possible_value: "STRING/STRING"},
        {key: "user", possible_value: "STRING"},
        {key: "org", possible_value: "STRING"},
        {key: "size", possible_value: "NUMBER"},
        {key: "followers", possible_value: "NUMBER"},
        {key: "forks", possible_value: "NUMBER"},
        {key: "stars", possible_value: "NUMBER"},
        {key: "created", possible_value: "DATE"},
        {key: "pushed", possible_value: "DATE"},
        {key: "language", possible_value: "STRING"},
        {key: "topics", possible_value: "STRING|NUMBER"},
        {key: "license", possible_value: "STRING"},
        {key: "is", possible_value: "public|private|sponsorable"},
        {key: "mirror", possible_value: "BOOLEAN"},
        {key: "archived", possible_value: "BOOLEAN"},
        {key: "good-first-issues", possible_value: "NUMBER"},
        {key: "help-wanted-issues", possible_value: "NUMBER"},
        {key: "has", possible_value: "funding-file"}
    ];

    public static parseQuery(query: string) {
        let parsed: {git: {[key: string]: string | string[]}, custom: {[key: string]: string | string[]}} = {git: {}, custom: {}};

        for (let queryItem of query.split(" ")) {
            if (["AND", "OR", "NOT"].includes(queryItem)) {
                //found logic gate
                continue;
            }
            try {
                let kv = queryItem.split(":");
                let key = kv[0];
                let value = kv[1];

                if (this.githubAcceptedQueries.some((v, i) => v.key == key && accepts(value, v.possible_value))) {
                    parsed.git[key] = value;
                } else {
                    //custom
                    if (key == "contains") {
                        if (
                            parsed.custom["contains"] != null &&
                            parsed.custom["contains"] instanceof String
                        ) {
                            //if already has a string
                            let tmp: string = (parsed.custom["contains"] as string);
                            parsed.custom["contains"] = [];
                            parsed.custom["contains"].push(...[tmp, value]);
                        } else if (parsed.custom["contains"] instanceof Array) {
                            //is already an array
        
                        } else {
                            //either null or unknown so free to override
                            parsed.custom["contains"] = value;
                        }
                    }
                    parsed.custom[key] = value;
                }
            } catch (e) {
                //either error in split or error when getting (e.g: not a k:v query item)
                //just contains
                if (
                    parsed.custom["contains"] != null &&
                    parsed.custom["contains"] instanceof String
                ) {
                    //if already has a string
                    let tmp: string = (parsed.custom["contains"] as string);
                    parsed.custom["contains"] = [];
                    parsed.custom["contains"].push(...[tmp, queryItem]);
                } else if (parsed.custom["contains"] instanceof Array) {
                    //is already an array

                } else {
                    //either null or unknown so free to override
                    parsed.custom["contains"] = queryItem;
                }

            }
        }
    }
}
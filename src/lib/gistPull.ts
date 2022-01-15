import fetch from 'node-fetch';
import { coolPeople } from './coolPeople';

type githubFileResponse = {[key :string]: {filename: string, type: string, language: string, raw_url: string, size: number, truncated: boolean, content: string}}


export const gistPull = async (link) => {
    
    return fetch(link).then( async (body) => {
        const text = await body.text();
        console.log(text)
        const json: coolPeople = JSON.parse(text);
        console.log(json)
        return json;
    })
}
export const updateCoolPeople = async(link) => {

    return fetch(link).then(async (body) => {
        const text = await body.text();
        const json = JSON.parse(text);

        const files: githubFileResponse = json.files;
        const file = files[Object.keys(files)[0]]
        const content = file.content;
        let coolPeople: coolPeople = JSON.parse(content);
        return coolPeople
    })
}
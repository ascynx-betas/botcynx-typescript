import { gistPull, updateCoolPeople } from "./gistPull";

export type coolPeopleType = | "developer" | "youtube rank" | "cool person" | "other developer" | "friend" | "staff"

export interface coolPeople {
    [key: string]: coolPeopleType
}
export const gistLink = "https://api.github.com/gists/65d7fbe29623a1497fffa6de8b754e95";

export let coolPeopleUUId: coolPeople = {
    "0ce87d5afa5f4619ae78872d9c5e07fe": "developer", //Ascynx
    "548548d6784a42f6821733fc6bca6a47": "youtube rank", //Alaawii
    "d0e05de76067454dbeaec6d19d886191": "other developer", //Moulberry
    "e686fe0aab804a71ac7011dc8c2b534c": "other developer", //syeyoung
    "89e5f85ac6a94c7c8ac2c241b4d9ecd9": "other developer", //rioho
    "bb902cc92e93403daf6c6eddc151b009": "cool person", //AveryBluePerson
    "f2012b8fcf024135b0f78610f54cbafc": "cool person", //ugandanKnuckles_
    "286169cbe5424f88a716c4b1fa29e93b": "cool person", //king_of_million
    "c9385237ccc74843b2c6c19385bce60a": "other developer", //Cobble8
    "b43d74579da4408ba9fb51239022cec9": "cool person", //Erymanthus
    "4e465a68b4d245b8ad42460a653cfa1b": "cool person", //Cyanoix
    "abc61a592d4843ffb2c9feb85a33f94f": "friend", //TheCarotte
    "7d6efbf2d6b54da7a95c3933bbbab53b": "cool person", //Doksito
}

export let coolTypeToEmojis = {
    "developer": "<:code:930047081983402004>",
    "youtube rank": "<:youtube:931875731821174816>",
    "other developer": "<a:coder:931875934318002227>",
    "cool person": "<:coolcat:931876119647510530>",
    "friend": "<:removefrend:912730760404959272>",
    "staff": "<:verified_mod:931876321129283584>",
}

export const reload = async () => {
    coolPeopleUUId = await updateCoolPeople(gistLink);
    
}
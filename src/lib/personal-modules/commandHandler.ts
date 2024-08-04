//this is for command handler things that are global to every commandCreate events
import { postStartData } from "../../events/ready";

export function canExecute(required: Array<string>) {
    for (let i = 0; i < required.length; i++) {
        let val = required[i];
        if (!postStartData[val.toLowerCase()]) {
            return false;
        }
    }

    return true;
}
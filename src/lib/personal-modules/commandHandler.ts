//this is for command handler things that are global to every commandCreate events
import { postStartData } from "../../events/ready";

export const RequireTest = (required: Array<string>) => required.every((v) => postStartData[v.toLowerCase()]);

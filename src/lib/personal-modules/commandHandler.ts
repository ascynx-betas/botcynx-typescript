//this is for command handler things that are global to every commandCreate events
import { postStartData } from "../../events/ready";

const RequireTest = async function (require: Array<string>) {
  let arrOfTest: Boolean[] = [];

  require.forEach(function (required) {
    let requireValue = required.toLowerCase();
    let globalValue = postStartData[requireValue];
    if (!globalValue || globalValue == false) arrOfTest.push(false);
    if (globalValue == true) arrOfTest.push(true);
  });
  if (arrOfTest.includes(false)) return false;
  return true;
};

export { RequireTest };

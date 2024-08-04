export interface compareResults {
  success: boolean;
  breakingcount?: number;
}

export const compareTest = function (arr1: string[], arr2: string[]): compareResults {
  let output: compareResults = {success: false};
  const breakingPoints = [];

  out:
  for (let item1 of arr1) {
    for (let item2 of arr2) {
      if (item1 != item2) continue;
      output.success = true;
      breakingPoints.push(item2);
      continue out;
    }
  }

  output.breakingcount = breakingPoints.length;

  return output;
}

function getTimeOfDay() {
  //create new date using current millis then set as string and take the current time as HH:MM:SS
  return new Date(Date.now()).toTimeString().split(" ")[0]
}

const isLink = function (potentialLink: string): boolean {
  let http = /http:\/\/./;
  let https = /https:\/\/./;

  let r1 = http.test(potentialLink);
  let r2 = https.test(potentialLink);
  if (r1 == true || r2 == true) {
    return true;
  } else return false;
};

const containsLink = function (message: string): number[] {
  let whitespace = /\s/gi;
  message = message.replace(whitespace, " ");
  let fields: string[] = message.split(" ");
  let arrayofresults = [];
  fields.forEach(function (field, index: number) {
    let result = isLink(field);
    if (result == true) {
      arrayofresults.push(index);
    }
  });

  return arrayofresults;
};

export {
  isLink,
  containsLink,
  getTimeOfDay
};

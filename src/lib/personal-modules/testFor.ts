export interface ctResult {
  success: boolean;
  breakingcount?: number;
}

export const compareTest = function (arr1: string[], arr2: string[]) {
  let output: {
    success: boolean,
    breakingcount?: number
  } = {success: false};
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

const getTimeOfDay = function (): string {
  let event = Date.now();
  let d = new Date(event);
  let sd = d.toTimeString();
  let fields = sd.split(" ");
  let time = fields[0];

  return time;
};

const isLink = function (potentiallink): boolean {
  let http = /http:\/\/./;
  let https = /https:\/\/./;

  let r1 = http.test(potentiallink);
  let r2 = https.test(potentiallink);
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

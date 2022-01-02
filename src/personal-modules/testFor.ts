const testfor = function (disabledarray: string[], testvalue: string) {
    //test for errors
    //variables
    let testedvalue = 0;
    let success: boolean;
  
    //function itself
    do {
      if (testvalue.includes(disabledarray[testedvalue])) {
        success = true;
        break;
      } else {
        testedvalue++;
      }
    } while (testedvalue != disabledarray.length);
    if (testedvalue == disabledarray.length && success != true) {
      success = false;
    }
    return success;
  };
  
const compare = function (array1: string[], array2: string[]) {
    //var
    let success: boolean;
  
    array1.forEach(function (array1) {
      let testedvalue = 0;
      do {
        if (array1 == array2[testedvalue]) {
          success = true;
          break;
        } else {
          testedvalue++;
        }
      } while (testedvalue != array2.length);
    });
  
    if (success != true) {
      success = false;
    }
    return success;
  };
  export interface ctResult extends Object {
    success: boolean,
    breakingcount?: number,
  };
const ct = function (array1: string[], array2: string[]): ctResult {
  
    let success: boolean;
    let breakingpoint = [];
    let result: ctResult;
    array1.forEach(function (array1) {
      let testedvalue = 0;
      do {
        if (array1 == array2[testedvalue]) {
          success = true;
          breakingpoint.push(array2[testedvalue]);
          break;
        } else {
          testedvalue++;
        }
      } while (testedvalue != array2.length);
    });
  
    let breakingcount = breakingpoint.length;
    if (success != true) {
      success = false;
      result = { success: success };
    } else {
      result = { success: success, breakingcount: breakingcount };
    }
    return result;
  };
  
const getTimeOfDay = function (): string {
    let event = Date.now();
    let d = new Date(event);
    let sd = d.toTimeString();
    let fields = sd.split(" ");
    let time = fields[0];
  
    return time;
  };
const e2r = function (timestamp: number): string {
    let d = new Date(timestamp);
    let sd = d.toTimeString();
    let fields = sd.split(" ");
    let time = fields[0];
  
    return time;
  };
const getTime = function (): string {
    let event = Date.now();
    let d = new Date(event);
    let sd = d.toDateString();
  
    return sd;
  };
  
const b2a = function (a: string): string {
    var c,
      d,
      e,
      f,
      g,
      h,
      i,
      j,
      o,
      b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      k = 0,
      l = 0,
      m = "",
      n = [];
    if (!a) return a;
    do
      (c = a.charCodeAt(k++)),
        (d = a.charCodeAt(k++)),
        (e = a.charCodeAt(k++)),
        (j = (c << 16) | (d << 8) | e),
        (f = 63 & (j >> 18)),
        (g = 63 & (j >> 12)),
        (h = 63 & (j >> 6)),
        (i = 63 & j),
        (n[l++] = b.charAt(f) + b.charAt(g) + b.charAt(h) + b.charAt(i));
    while (k < a.length);
    return (
      (m = n.join("")),
      (o = a.length % 3),
      (o ? m.slice(0, o - 3) : m) + "===".slice(o || 3)
    );
  };
  
const a2b = function (a: string): string {
    var b,
      c,
      d,
      e = {},
      f = 0,
      g = 0,
      h = "",
      i = String.fromCharCode,
      j = a.length;
    for (b = 0; 64 > b; b++)
      e[
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(
          b
        )
      ] = b;
    for (c = 0; j > c; c++)
      for (b = e[a.charAt(c)], f = (f << 6) + b, g += 6; g >= 8; )
        ((d = 255 & (f >>> (g -= 8))) || j - 2 > c) && (h += i(d));
    return h;
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
  /**
   * @param  {} message
   */
const containsLink = function (message): number[] {
    let fields = message.split(" ");
    let result;
    let arrayofresults = [];
    fields.forEach(function (fields, index: number) {
      result = isLink(fields);
      if (result == true) {
        arrayofresults.push(index);
      }
    });
  
    return arrayofresults;
  };

  
  export {isLink, containsLink, a2b, b2a, getTime, getTimeOfDay, e2r, compare, ct, testfor};
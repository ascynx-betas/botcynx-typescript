export const timestampToHuman = (timestamp: number): string => {
    let data = {time: timestamp, type: 'timestamp'};
    data = {time: timestamp / 1000, type: 'seconds'};
        if (data.time >= 60) data = {time: data.time / 60, type: 'minutes'};
            if (data.time >= 60) data = {time: data.time / 60, type: 'hours'};
                if (data.time >= 24) data = {time: data.time / 24, type: 'days'};
                    if (data.time >= 7) data = {time: data.time / 7, type: 'weeks'};
                        if (data.time >= 4) data = {time: data.time / 4, type: 'months'};
                        data.time = Math.floor(Math.round(data.time * 10) / 10); //round number to decimal

    return `${data.time} ${data.type}`
}

export const similarityDetection = (word: string, testWord: string): {result: boolean, percentage: number} => {
    const testWordLength = testWord.length;
    const wordLength = word.length;
    let testLetterArray: string[] = [];
    let LetterArray: string[] = [];
    let similarityArray: boolean[] = [];

    for (let i = 0; i < testWordLength; i++) {
        testLetterArray[i] = testWord[i];

    }
    for (let i = 0; i < wordLength; i++) {
        LetterArray[i] = word[i];

    }

    testLetterArray.forEach((testLetter, i) => {
        if (LetterArray[i] == testLetter) similarityArray.push(true);
        else similarityArray.push(false);
    });

    const isTrue = similarityArray.filter(b => b);
    let percentageOfSimilarities = (100 / similarityArray.length) * isTrue.length;

    const overflowLettersLength = LetterArray.length - testLetterArray.length;
    if (overflowLettersLength >= 1) {
    percentageOfSimilarities = percentageOfSimilarities - (testLetterArray.length - overflowLettersLength) * 5;
    if (percentageOfSimilarities <= 0) percentageOfSimilarities = 0;
    }

    if (percentageOfSimilarities <= 95) return {result: true, percentage: percentageOfSimilarities};
    else return {result: false, percentage: percentageOfSimilarities};
}
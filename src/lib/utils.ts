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
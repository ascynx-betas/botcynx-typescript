#!/usr/bin/env bash

## cleans empty files left by the typescript transpiler
ACTION_PATH=./dist
SILENT=0

debug() {
    if [ $SILENT == 0 ]
    then
        echo $1
    fi
}

clean() {
    if [ ! -d $ACTION_PATH ]
    then
        echo "$ACTION_PATH is not a directory">&2
        exit 1
    fi

    debug "triggering clean script in: $ACTION_PATH"

    for i in $(find $ACTION_PATH -empty);
    do
        if [ -f $i ]
        then
            #if it's a file
            debug "found: $i">&1
            rm -rf $i
        fi
    done;


}

while getopts "p:s" opt; do
    case $opt in
        p)
        ACTION_PATH=$OPTARG
        ;;
        s)
        SILENT=1
        ;;
        \?)
        echo "Invalid option: -$OPTARG" >&2
        exit 1
        ;;
        :)
        echo "Option -$OPTARG requires an argument." >&2
        exit 1
        ;;
    esac
done

clean

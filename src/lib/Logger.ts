import chalk from "chalk";
import { Collection } from "discord.js";
import { botcynx, finishedLoading } from "..";

const loggerQueue: {message: string, level: logLevel, logger: Logger}[] = [];

export const postLoadingLogs = () => {
  for (let queueItem of loggerQueue) {
    queueItem.logger.log(queueItem.message, queueItem.level);
  }
  //clear array
  loggerQueue.length = 0;

}

export class LoggerFactory {
  private static loggers: Collection<string, Logger> = new Collection<
    string,
    Logger
  >();

  private static inheritedValues: {renderTime: boolean, showCallStack: boolean} = {renderTime: false, showCallStack: false};

  static getLogger(loggerName: string) {
    if (!this.loggers.get(loggerName)) {
      let logger = new Logger(loggerName);
      for (let key of Object.keys(this.inheritedValues)) {
        let value = this.inheritedValues[key];
        if (logger[key] != null) {
          //exists
          logger[key] = value;
        }
      }

      this.loggers.set(loggerName, logger);
    }
    return this.loggers.get(loggerName);
  }

  static set shouldRenderTime(bool: boolean) {
    if (this.inheritedValues.renderTime === bool) return;
    this.inheritedValues.renderTime = bool;
    this.loggers.forEach((logger) => {
      logger.renderTime = bool;
    });
  }

  static set shouldShowCallStack(bool: boolean) {
    if (this.inheritedValues.showCallStack == bool) return;
    this.inheritedValues.showCallStack = bool;
    this.loggers.forEach((logger) => {
      logger.showCallStack = true;
    })
  }
}

class Logger {
  private name: string;
  public renderTime: boolean;
  public showCallStack: boolean = false;

  public getName() {
    return this.name;
  }

  private get currentTime() {
    let date = new Date(Date.now());
    let formattedDate = `${
      date.getHours() > 10 ? date.getHours() : "0" + date.getHours()
    }:${date.getMinutes() > 10 ? date.getMinutes() : "0" + date.getMinutes()}:${
      date.getSeconds() > 10 ? date.getSeconds() : "0" + date.getSeconds()
    }-${
      date.getMilliseconds() > 100
        ? date.getMilliseconds()
        : date.getMilliseconds() > 10
        ? "0" + date.getMilliseconds()
        : "00" + date.getMilliseconds()
    }`;
    return formattedDate;
  }

  constructor(name: string) {
    this.name = name;
  }

  info(message: any) {
    this.log(message instanceof String ? message : JSON.stringify(message), logLevel.INFO);
  }
  warn(message: any) {
    this.log(message instanceof String ? message : JSON.stringify(message), logLevel.WARN);
  }
  error(error: Error) {
    this.log(this.showCallStack ? error.stack : error.message, logLevel.ERROR);
  }
  debug(message: any) {
    this.log(message instanceof String ? message : JSON.stringify(message), logLevel.DEBUG);
  }

  fatal(message: any) {
    this.log(message instanceof String ? message : JSON.stringify(message), logLevel.FATAL);
  }

  log(message: any, level: logLevel, bypassQueue: boolean = false) {
    if (!finishedLoading && !bypassQueue) {
      loggerQueue.push({message, level, logger: this});
      this.log("Added log to queue", logLevel.DEBUG, true);
      return;
    }

    if (level == logLevel.DEBUG) {
      if ((botcynx && !botcynx.isDebug) || process.env.environment != "debug") return;
    }
    let prefix = level;
    let out = this.getConsoleLevel(level);
    out(
      `${this.renderTime ? `[${this.currentTime}] ` : ""}${this.getPrefixColor(
        level
      )(`[${this.name}/${prefix}]`)} ${chalk.white(message)}`
    );
  }

  table(message: object, level: logLevel) {
    if (level == logLevel.DEBUG && !botcynx.isDebug()) return;
    let prefix = level;
    let out = console.table;

    this.getConsoleLevel(level)(
      `${this.renderTime ? `[${this.currentTime}] ` : " "}${this.getPrefixColor(
        level
      )(`[${this.name}/${prefix}]`)}`
    );
    out(message);
  }

  private getConsoleLevel(level: logLevel) {
    switch (level) {
      case logLevel.DEBUG:
      case logLevel.WARN: {
        return console.warn;
      }
      case logLevel.ERROR:
      case logLevel.FATAL: {
        return console.error;
      }
      default: {
        return console.log;
      }
    }
  }

  private getPrefixColor(level: logLevel) {
    switch (level) {
      case logLevel.DEBUG: {
        return chalk.hex("#F4BC1C");
      }
      case logLevel.WARN: {
        return chalk.hex("#F58216");
      }
      case logLevel.ERROR:
      case logLevel.FATAL: {
        return chalk.hex("#800000");
      }
      case logLevel.INFO: {
        return chalk.greenBright;
      }
      default: {
        return chalk.white;
      }
    }
  }
}

export enum logLevel {
  INFO = "INFO",
  WARN = "WARN",
  DEBUG = "DEBUG",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

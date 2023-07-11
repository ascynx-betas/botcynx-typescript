import chalk, { Chalk } from "chalk";
import { Collection } from "discord.js";
import { botcynx, finishedLoading } from "..";
import { BotClient } from "../structures/botClient";

const loggerQueue: {message: string | object, level: LogLevel, logger: Logger, table?: boolean}[] = [];

export const postLoadingLogs = (client: BotClient) => {
  for (let queueItem of loggerQueue) {
    if (queueItem.table) {
      if (typeof queueItem.message !== "object") {
        throw new TypeError("Logger#table does not support strings");
      }
      queueItem.logger.table(queueItem.message as object, queueItem.level);
    } else {
      queueItem.logger.log(queueItem.message, queueItem.level);
    }
  }
  //clear array
  loggerQueue.length = 0;

}

export class LoggerFactory {
  private static loggers: Collection<string, Logger> = new Collection<
    string,
    Logger
  >();

  static lastMessage: string;
  //how many time the last message was repeated
  static repeated: number;

  private static inheritedValues: {renderTime: boolean, showCallStack: boolean, modeOverride?: LogLevel[]} = {renderTime: false, showCallStack: false};

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

  /**
   * Limit the log modes that will show up on the loggers
   */
  static overrideModes(...logLevels: LogLevel[]) {
    this.inheritedValues.modeOverride = logLevels;
    this.loggers.forEach((logger) => logger.setModeOverride(...logLevels));
  }

  static set shouldShowCallStack(bool: boolean) {
    if (this.inheritedValues.showCallStack == bool) return;
    this.inheritedValues.showCallStack = bool;
    this.loggers.forEach((logger) => {
      logger.showCallStack = true;
    })
  }

  private static MOVE_CURSOR = true;

  static canMoveCursor(): boolean {
    return LoggerFactory.MOVE_CURSOR;
  }
  static setMoveCursor(bool: boolean) {
    LoggerFactory.MOVE_CURSOR = bool;
  }

 }

class Logger {
  private name: string;
  public renderTime: boolean;
  public showCallStack: boolean = false;
  public modeOverride: LogLevel[] = [];//whatever is not in that array will not show up from this logger

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

  /**
   * Limit the modes shown on this logger
   */
  setModeOverride(...logLevels: LogLevel[]) {
    this.modeOverride = logLevels;
  }

  /**
   * Add a mode to those shown on this logger
   */
  addModeOverride(...logLevels: LogLevel[]) {
    for (let logLevel of logLevels) {
      if (!this.modeOverride.includes(logLevel)) this.modeOverride.push(logLevel);
    }
  }

  info(message: any) {
    this.log(typeof(message) == "string" ? message : JSON.stringify(message), LogLevel.INFO);
  }
  warn(message: any) {
    this.log(typeof(message) == "string" ? message : JSON.stringify(message), LogLevel.WARN);
  }
  error(error: Error) {
    this.log(this.showCallStack ? error.stack : error.message, LogLevel.ERROR);
  }
  debug(message: any) {
    this.log(typeof(message) == "string" ? message : JSON.stringify(message), LogLevel.DEBUG);
  }

  fatal(message: any) {
    this.log(typeof(message) == "string" ? message : JSON.stringify(message), LogLevel.FATAL);
  }

  log(message: any, level: LogLevel, bypassQueue: boolean = false) {
    if (!finishedLoading && !bypassQueue) {
      loggerQueue.push({message, level, logger: this});
      this.log("Added log to queue", LogLevel.DEBUG, true);
      return;
    }

    if (this.modeOverride.length > 0 && !this.modeOverride.includes(level)) {
      return;
    }

    if (level == LogLevel.DEBUG) {
      if (((botcynx && !botcynx.isDebug) || process.env.environment != "debug") && !this.modeOverride.includes(LogLevel.DEBUG)) return;
    }
    const prefix = level;
    const out = level.consoleLevel;
    let m = `${this.renderTime ? `[${this.currentTime}] ` : ""}${level.prefixColor(`[${this.name}/${prefix}]`)} ${chalk.white(message)}`;
    
    if (LoggerFactory.lastMessage === m) {
      LoggerFactory.repeated++;
      this.clearLastLine();

      //append it
      m += ` (${LoggerFactory.repeated})`;
      out(m);
      return;
    }

    LoggerFactory.lastMessage = m;
    LoggerFactory.repeated = 1;
    out(m);
  }

  table(message: object, level: LogLevel, bypassQueue: boolean = false) {
    if (!finishedLoading && !bypassQueue) {
      loggerQueue.push({message, level, logger: this, table: true});
      this.log("Added log to queue", LogLevel.DEBUG, true);
      return;
    }

    if (this.modeOverride.length > 0 && !this.modeOverride.includes(level)) {
      return;
    }

    if (level == LogLevel.DEBUG) {
      if (((botcynx && !botcynx.isDebug) || process.env.environment != "debug") && !this.modeOverride.includes(LogLevel.DEBUG)) return;
    }
    let prefix = level;
    let out = console.table;

    level.consoleLevel(
      `${this.renderTime ? `[${this.currentTime}] ` : " "}${level.prefixColor(`[${this.name}/${prefix}]`)}`
    );
    out(message);
  }

  private clearLastLine() {
    if (!LoggerFactory.canMoveCursor()) {
      return;
    }

    if (!process.stdout.moveCursor) {
      LoggerFactory.setMoveCursor(false);
      return;
    }

    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(1);
  }
}

export class LogLevel {
  //------ Instances ------//

  static readonly INFO = new LogLevel(
    "INFO",
    chalk.greenBright,
    console.log
  );

  static readonly WARN = new LogLevel(
    "WARN",
    chalk.hex("#F58216"),
    console.warn
  );

  static readonly DEBUG = new LogLevel(
    "DEBUG",
    chalk.hex("#F4BC1C"),
    console.warn
  );

  static readonly ERROR = new LogLevel(
    "ERROR",
    chalk.hex("#800000"),
    console.error
  );

  static readonly FATAL = new LogLevel(
    "FATAL",
    chalk.hex("#800000"),
    console.error
  );

  //------ Static Methods ------//

  static get values(): LogLevel[] {
    return [
      this.INFO,
      this.WARN,
      this.DEBUG,
      this.ERROR,
      this.FATAL
    ];
  }

  /**
   * Converts a string to its corresponding Enum instance.
   *
   * @param string the string to convert to Enum
   * @throws RangeError, if a string that has no corressonding Enum value was passed.
   * @returns the matching Enum
   */
  static fromString(string: string): LogLevel {
    // Works assuming the name property of the enum is identical to the variable's name.
    const value = (this as any)[string];
    if (value && value instanceof this) {
      return value;
    }

    throw new RangeError(
      `Illegal argument passed to fromString(): ${string} does not correspond to any instance of the enum ${
        (this as any).prototype.constructor.name
      }`
    );
  }

  //------ Constructor------//

  private constructor(
   /**
    * The name of the instance; should be exactly the variable name,
    * for serializing/deserializing simplicity.
    */
    public readonly name: string,
    public readonly prefixColor: Chalk,
    public readonly consoleLevel: Function
  ) {}

  //------ Methods ------//

  /**
   * Called when converting the Enum value to a string using JSON.Stringify.
   * Compare to the fromString() method, which deserializes the object.
   */
  public toJSON() {
    return this.name;
  }

  public toString() {
    return this.toJSON();
  }
}

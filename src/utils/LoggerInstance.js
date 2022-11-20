import LoggerConfig from "./LoggerConfig.js";

export default class LoggerInstance
{
  static loggerService = null;

  static getLogger() {
    if (this.loggerService === null && LoggerConfig.loggerClass) {
      this.createLogger();
    }

    return this.loggerService;
  }

  static createLogger() {
    if (LoggerConfig.loggerClass) {
      this.loggerService = LoggerConfig.loggerClass;
    } else {
      this.loggerService = null;
    }
  }
}

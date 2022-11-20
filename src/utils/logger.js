import {createString} from "../functions/stringFunctions.js";
import LoggerConfig from "./LoggerConfig.js";
import LoggerInstance from "./LoggerInstance.js";

const logLine = "<------------------------ LOG ------------------------>";
const errorLine = "<----------------------- ERROR ----------------------->";
const debugLine = "<----------------------- DEBUG ----------------------->";

/**
 * @param message
 */
export function log(message) {
  if (LoggerConfig.showLogs) {
    console.log(logLine);
    console.log(message);
    console.log();
  }
  if (LoggerInstance.getLogger()) {
    LoggerInstance.getLogger().log(message);
  }
}

/**
 * @param message
 */
export function error(message) {
  if (LoggerConfig.showErrors) {
    console.error(errorLine);
    console.error(message);
    console.log();
  }
  if (LoggerInstance.getLogger()) {
    LoggerInstance.getLogger().error(message);
  }
}

/**
 * @param message
 */
export function debug(message) {
  if (LoggerConfig.showDebug) {
    console.debug(debugLine);
    console.debug(message);
    console.log();
  }
  if (LoggerInstance.getLogger()) {
    LoggerInstance.getLogger().debug(message);
  }
}

/**
 * @param percentage
 */
export function loading(percentage) {
  if (LoggerConfig.showLoading) {
    console.clear();
    let loadingBar = "";
    loadingBar += createString("▓", Math.round(percentage));
    loadingBar += createString("░", 100 - Math.round(percentage));
    loadingBar += "  " + Math.round(percentage * 100) / 100 + "%";
    console.debug(loadingBar);
    console.log();
  }

  if (LoggerInstance.getLogger()) {
    LoggerInstance.getLogger().loading(percentage);
  }
}

export default { log, error, debug, loading };


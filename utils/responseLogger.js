const logger = require("../config/logger.js");

/**
 * Sends a standardized JSON response and logs it.
 * 
 * @param {Object} options
 * @param {Object} options.res - Express response object
 * @param {Number} options.status - HTTP status code
 * @param {String} options.tag - Short tag for error/success category
 * @param {String} options.message - Description message
 * @param {Object} [options.data] - Optional response payload
 * @param {Object} [options.meta] - Optional metadata
 * @param {Object} [options.log] - Optional log object (pino child logger)
 */
exports.sendResponse = ({ res, status, tag, message, data = null, meta = null, log = null }) => {
  const response = {
    status,
    tag,
    message,
    ...(data && { data }),
    ...(meta && { meta })
  };

  // Log based on status code range
  if (log) {
    if (status >= 500) log.error(response, message);
    else if (status >= 400) log.warn(response, message);
    else log.info(response, message);
  } else {
    if (status >= 500) logger.error(response, message);
    else if (status >= 400) logger.warn(response, message);
    else logger.info(response, message);
  }

  return res.status(status).json(response);
};
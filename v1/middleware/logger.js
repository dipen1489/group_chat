import winston from 'winston'

// Create a Winston logger with console transport
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
});

function logMiddleware(req, res, next) {
  // Log request details
  logger.info(`${new Date().toISOString()} - Request - ${req.method} ${req.originalUrl}`);
  logger.info(`Headers: ${JSON.stringify(req.headers)}`);
  logger.info(`Body: ${JSON.stringify(req.body)}`);

  // Save the current response.write and response.end functions
  const originalWrite = res.write;
  const originalEnd = res.end;

  // Capture response data
  const chunks = [];

  // Override response.write
  res.write = function (chunk) {
    chunks.push(Buffer.from(chunk));
    originalWrite.apply(res, arguments);
  };

  // Override response.end
  res.end = function (chunk) {
    if (chunk) chunks.push(Buffer.from(chunk));

    const responseBody = Buffer.concat(chunks).toString('utf8');

    // Log response details
    logger.info(`${new Date().toISOString()} - Response - Status: ${res.statusCode}`);
    logger.info(`Headers: ${JSON.stringify(res.getHeaders())}`);
    logger.info(`Body: ${responseBody}`);

    // Restore original functions
    res.write = originalWrite;
    res.end = originalEnd;

    // Continue with the response
    originalEnd.apply(res, arguments);
  };

  // Log any errors that occur during the request
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      logger.error(`${new Date().toISOString()} - Error - Status: ${res.statusCode}`);
      logger.error(`Headers: ${JSON.stringify(res.getHeaders())}`);
    }
  });

  next();
}

export default logMiddleware;

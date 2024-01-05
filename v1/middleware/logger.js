import winston from 'winston'

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
});

function logMiddleware(req, res, next) {
  logger.info(`${new Date().toISOString()} - Request - ${req.method} ${req.originalUrl}`);
  logger.info(`Headers: ${JSON.stringify(req.headers)}`);
  logger.info(`Body: ${JSON.stringify(req.body)}`);

  const originalWrite = res.write;
  const originalEnd = res.end;

  const chunks = [];

  res.write = function (chunk) {
    chunks.push(Buffer.from(chunk));
    originalWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk) chunks.push(Buffer.from(chunk));

    const responseBody = Buffer.concat(chunks).toString('utf8');

    logger.info(`${new Date().toISOString()} - Response - Status: ${res.statusCode}`);
    logger.info(`Headers: ${JSON.stringify(res.getHeaders())}`);
    logger.info(`Body: ${responseBody}`);

    res.write = originalWrite;
    res.end = originalEnd;

    originalEnd.apply(res, arguments);
  };

  res.on('finish', () => {
    if (res.statusCode >= 400) {
      logger.error(`${new Date().toISOString()} - Error - Status: ${res.statusCode}`);
      logger.error(`Headers: ${JSON.stringify(res.getHeaders())}`);
    }
  });

  next();
}

export default logMiddleware;

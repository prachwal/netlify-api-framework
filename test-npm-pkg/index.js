import { NetlifyRouter, createResourceRouter, consoleFormat } from 'netlify-api-framework';
import winston from 'winston';

console.log(typeof NetlifyRouter, typeof createResourceRouter);

// Test the consoleFormat by formatting a sample log message
const testLogger = winston.createLogger({
  format: consoleFormat,
  transports: [new winston.transports.Console()]
});

testLogger.info('Test log message', { foo: 'bar', answer: 42 });

testLogger.error('Test error message', { error: 'Something went wrong' });

setTimeout(() => {
  console.log('force exit');
  process.exit(0);
}, 1000);

import { buildServer } from './app.js';
import { loadServerConfig } from './serverConfig.js';

const config = loadServerConfig();
const { app } = await buildServer(config);

async function shutdown() {
  app.log.info({ event: 'server.shutdown' }, 'Shutting down match server');
  await app.close();
}

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());

try {
  await app.listen({ host: config.host, port: config.port });
  app.log.info({
    event: 'server.started',
    host: config.host,
    port: config.port,
    clientOrigins: config.clientOrigins,
  }, 'Match server started');
} catch (error) {
  app.log.error({ event: 'server.start_failed', err: error }, 'Match server failed to start');
  process.exitCode = 1;
}

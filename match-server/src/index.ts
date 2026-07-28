import { buildServer } from './app.js';
import { loadServerConfig } from './serverConfig.js';

const config = loadServerConfig();
const { app } = await buildServer(config);

async function shutdown() {
  await app.close();
}

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}

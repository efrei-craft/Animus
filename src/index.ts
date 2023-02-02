import { AnimusApiServer } from './realms/api';
import consolaGlobalInstance from "consola";

import "reflect-metadata";

const server = new AnimusApiServer();

const initServer = async () => {
  server.registerServerRoutes();
  await server.start();
}

initServer().then(() => {
  consolaGlobalInstance.success(`Server started successfully.`);
}).catch((err) => {
  consolaGlobalInstance.error(`Server failed to start: ${err}`);
});
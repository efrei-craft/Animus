import { AnimusApiServer } from './realms/api';
import consolaGlobalInstance from "consola";

const server = new AnimusApiServer();

const initServer = async () => {
  await server.start();
}

initServer().then(() => {
  consolaGlobalInstance.success(`Server started successfully.`);
}).catch((err) => {
  consolaGlobalInstance.error(`Server failed to start: ${err}`);
});
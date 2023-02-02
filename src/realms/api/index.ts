import Hapi from '@hapi/hapi';
import { routes as PlayerRoutes } from "./players";
import consolaGlobalInstance from "consola";

export class AnimusApiServer {

  server: Hapi.Server;

  constructor() {
    this.server = Hapi.server({
      port: process.env.PORT || 3000,
      host: process.env.HOST || '0.0.0.0'
    })

    this.registerServerRoutes();
  }

  registerServerRoutes() {
    consolaGlobalInstance.debug('Registering server routes...')
    this.server.route(PlayerRoutes);
  }

  async start() {
    await this.server.start();
    consolaGlobalInstance.success(`Hapi server running @ ${this.server.info.uri}`);
  }

}
import {ApiScope, PrismaClient} from "@prisma/client";
import Fastify, {FastifyInstance} from "fastify";

import { bootstrap } from 'fastify-decorators';
import { resolve } from 'path';

import consolaGlobalInstance from "consola";

const prisma = new PrismaClient();

export class AnimusApiServer {

  server: FastifyInstance;

  constructor() {
    this.server = Fastify({
      logger: true
    });
  }

  registerServerRoutes() {
    consolaGlobalInstance.debug('Registering server routes...')

    this.server.register(bootstrap, {
      directory: resolve(__dirname, `controllers`),
      mask: /\.controller\./,
    });
  }

  async start() {
    this.server.listen({
      port: parseInt(process.env.PORT) || 3000,
      host: process.env.HOST || '0.0.0.0'
    }).then((address) => {
      consolaGlobalInstance.success(`Fastify server running @ ${address}`);
    }).catch((err) => {
      consolaGlobalInstance.error(`Fastify server failed to start:`, err);
    });
  }

}
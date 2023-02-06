import { resolve } from "path"
import consolaGlobalInstance from "consola"

import Fastify, { FastifyInstance } from "fastify"
import { bootstrap } from "fastify-decorators"
import FastifySwagger from "@fastify/swagger"
import FastifySwaggerUI from "@fastify/swagger-ui"
import * as fs from "fs"
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import SwaggerConfig from "./config/SwaggerConfig"

export class AnimusRestServer {
  server: FastifyInstance

  constructor() {
    this.server = Fastify({
      logger: process.env.NODE_ENV !== "production"
    }).withTypeProvider<TypeBoxTypeProvider>()
  }

  async registerServerRoutes() {
    consolaGlobalInstance.debug("Registering server routes...")

    await this.registerSchemas()

    this.server.register(FastifySwagger, SwaggerConfig)

    this.server.register(FastifySwaggerUI, {
      routePrefix: "/docs"
    })

    this.server.register(bootstrap, {
      directory: resolve(__dirname, `controllers`),
      mask: /\.controller\./
    })
  }

  async registerSchemas() {
    const schemas = fs.readdirSync(resolve(__dirname, "schemas"))
    for (const schema of schemas) {
      const schemaName = schema.split(".")[0]
      const schemaContent = await import(`./schemas/${schema}`)
      this.server.addSchema(schemaContent.default)
      consolaGlobalInstance.debug(
        `Registered schema ${schemaName} to Fastify server`
      )
    }
  }

  async start() {
    this.server
      .listen({
        port: parseInt(process.env.PORT) || 3000,
        host: process.env.HOST || "0.0.0.0"
      })
      .then((address) => {
        consolaGlobalInstance.success(`Fastify server running @ ${address}`)
      })
      .catch((err) => {
        consolaGlobalInstance.error(`Fastify server failed to start:`, err)
      })
  }
}

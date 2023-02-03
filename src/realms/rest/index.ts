import { resolve } from "path"
import consolaGlobalInstance from "consola"

import Fastify, { FastifyInstance } from "fastify"
import { bootstrap } from "fastify-decorators"
import FastifySwagger from "@fastify/swagger"
import FastifySwaggerUI from "@fastify/swagger-ui"
import * as fs from "fs"
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"

export class AnimusRestServer {
  server: FastifyInstance

  constructor() {
    this.server = Fastify({
      logger: process.env.NODE_ENV !== "production"
    }).withTypeProvider<TypeBoxTypeProvider>()
  }

  async registerServerRoutes() {
    consolaGlobalInstance.debug("Registering server routes...")

    this.server.register(FastifySwagger, {
      swagger: {
        info: {
          title: "Animus",
          description: "Système de gestion du serveur EfreiCraft",
          version: process.env.npm_package_version
        },
        host: process.env.API_HOST || "localhost:3000",
        schemes: process.env.NODE_ENV === "production" ? ["https"] : ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
          { name: "players", description: "Player related end-points" },
          { name: "punishments", description: "Punishment related end-points" },
          {
            name: "permissions",
            description: "Permissions related end-points"
          },
          { name: "game", description: "Game related end-points" },
          { name: "server", description: "Server related end-points" },
          { name: "misc", description: "Miscellaneous api related end-points" }
        ],
        securityDefinitions: {
          bearerAuth: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            description: "Enter your Bearer token like this: Bearer {token}"
          }
        }
      }
    })

    await this.registerSchemas()

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

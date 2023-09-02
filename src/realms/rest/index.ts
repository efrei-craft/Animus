import { resolve } from "path"
import consolaGlobalInstance, { Consola } from "consola"

import Fastify, { FastifyInstance } from "fastify"
import { bootstrap } from "fastify-decorators"
import FastifySwagger from "@fastify/swagger"
import FastifySwaggerUI from "@fastify/swagger-ui"
import FastifyCors from "@fastify/cors"
import * as fs from "fs"
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import SwaggerConfig from "./config/SwaggerConfig"

export class AnimusRestServer {
  private static instance: AnimusRestServer

  private logger: Consola

  private server: FastifyInstance

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  async registerServerRoutes() {
    this.getLogger().debug("Registering server routes and schemas...")

    await this.registerSchemas()

    this.getServer().register(FastifySwagger, SwaggerConfig)

    this.getServer().register(FastifySwaggerUI, {
      routePrefix: "/docs",
      uiConfig: {
        displayOperationId: true,
        persistAuthorization: true,
        syntaxHighlight: {
          activate: true,
          theme: "agate"
        },
        deepLinking: true
      }
    })

    this.getServer().register(FastifyCors, {
      origin: "*"
    })

    this.getServer().get("/", async (request, reply) => {
      reply.redirect("/docs")
    })

    this.getServer().register(bootstrap, {
      directory: resolve(__dirname, `endpoints/controllers`),
      mask: /\.controller\./
    })

    // custom content type parser for json to allow for empty body
    this.getServer().addContentTypeParser(
      "application/json",
      { parseAs: "string" },
      (req, body, done) => {
        try {
          if (typeof body === "string") {
            const json = body ? JSON.parse(body) : {}
            done(null, json)
          }
        } catch (err) {
          err.statusCode = 400
          done(err, undefined)
        }
      }
    )
  }

  async registerSchemas() {
    const schemas = fs.readdirSync(resolve(__dirname, "schemas"))
    for (const schema of schemas) {
      const schemaName = schema.split(".")[0]
      const schemaContent = await import(`./schemas/${schema}`)
      this.getServer().addSchema(schemaContent.default)
      this.getLogger().debug(
        `Registered schema ${schemaName} to Fastify server`
      )
    }
  }

  async start() {
    await this.registerServerRoutes()

    this.getServer()
      .listen({
        port: parseInt(process.env.PORT) || 3000,
        host: process.env.HOST || "0.0.0.0"
      })
      .then((address) => {
        this.getLogger().ready(`Fastify server running @ ${address}`)
      })
      .catch((err) => {
        this.getLogger().error(`Fastify server failed to start:`, err)
      })
  }

  getServer(): FastifyInstance {
    if (!this.server) {
      this.server = Fastify({
        logger: process.env.NODE_ENV !== "production"
      }).withTypeProvider<TypeBoxTypeProvider>()
    }
    return this.server
  }

  getLogger() {
    if (!this.logger) {
      this.logger = consolaGlobalInstance.withTag("REST")
    }
    return this.logger
  }

  static getInstance(): AnimusRestServer {
    if (!AnimusRestServer.instance) {
      AnimusRestServer.instance = new AnimusRestServer()
    }
    return AnimusRestServer.instance
  }
}

import { RegisterOptions } from "fastify";
import { FastifyDynamicSwaggerOptions } from "@fastify/swagger";

const DEFAULT_SWAGGER_URL = "localhost:3000"

function processSwaggerURL(url: string): string {
  if (!url) return DEFAULT_SWAGGER_URL

  return url.replace(/^http(s?):\/\//, "")
}

const SwaggerConfig: RegisterOptions & FastifyDynamicSwaggerOptions = {
  swagger: {
    info: {
      title: "Animus",
      description: "Système de gestion du serveur Efrei Craft",
      version: process.env.npm_package_version
    },
    host: processSwaggerURL(process.env.SWAGGER_URL),
    schemes: process.env.NODE_ENV === "production" ? ["https"] : ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [
      {name: "players", description: "Player related end-points"},
      {name: "punishments", description: "Punishment related end-points"},
      {name: "permissions", description: "Permission groups related end-points"},
      {name: "party", description: "Party related end-points"},
      {name: "members", description: "Member related end-points"},
      {name: "games", description: "Games related end-points"},
      {name: "servers", description: "Servers related end-points"},
      {name: "templates", description: "Templates related end-points"},
      {name: "queues", description: "Queues related end-points"},
      {name: "chat", description: "Chat related end-points"},
      {name: "auth", description: "Authentication related end-points"},
      {name: "misc", description: "Miscellaneous api related end-points"}
    ],
    securityDefinitions: {
      apiKey: {
        type: "apiKey",
        name: "x-api-key",
        in: "header"
      }
    }
  },
  refResolver: {
    clone: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    buildLocalReference(json, baseUri, fragment, i): string {
      return json.$id.toString()
    }
  }
}

export default SwaggerConfig

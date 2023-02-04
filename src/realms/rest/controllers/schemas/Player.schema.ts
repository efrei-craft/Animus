import { FastifySchema } from "fastify"
import { Static, Type } from "@sinclair/typebox"
import PlayerSchema from "../../schemas/Player.schema"

enum PlayerConnectError {
  USER_BANNED = "user-banned"
}

const PlayerConnectBodySchema = Type.Object({
  uuid: Type.String(),
  username: Type.String()
})

export const PlayerConnectSchema: FastifySchema = {
  tags: ["players"],
  summary: "A player connects to the server",
  security: [
    {
      bearerAuth: []
    }
  ],
  body: PlayerConnectBodySchema,
  response: {
    200: Type.Ref(PlayerSchema),
    400: Type.Object({
      error: Type.String({ enum: Object.values(PlayerConnectError) }),
      message: Type.String()
    })
  }
}

export type PlayerConnectBodySchema = Static<typeof PlayerConnectBodySchema>

const PlayerGetPermissionsParamsSchema = Type.Object({
  uuid: Type.String()
})

export const PlayerGetPermissionsSchema: FastifySchema = {
  tags: ["players"],
  summary:
    "Get a player's permissions (also gets the permissions of their permission groups)",
  security: [
    {
      bearerAuth: []
    }
  ],
  params: PlayerGetPermissionsParamsSchema,
  response: {
    200: Type.Array(Type.String()),
    404: Type.Object({
      error: Type.String({ enum: ["player-not-found"] })
    })
  }
}

const PlayerAddPermissionsParamsSchema = Type.Object({
  uuid: Type.String()
})

const PlayerAddPermissionsBodySchema = Type.Object({
  permissions: Type.Array(Type.String())
})

export const PlayerAddPermissionsSchema: FastifySchema = {
  tags: ["players"],
  summary: "Add permissions to a player",
  security: [
    {
      bearerAuth: []
    }
  ],
  params: PlayerAddPermissionsParamsSchema,
  body: PlayerAddPermissionsBodySchema,
  response: {
    200: Type.Array(Type.String()),
    404: Type.Object({
      error: Type.String({ enum: ["player-not-found"] })
    })
  }
}

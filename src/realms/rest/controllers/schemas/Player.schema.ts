import { FastifySchema } from "fastify"
import { Static, Type } from "@sinclair/typebox"
import PlayerSchema from "../../schemas/Player.schema"

const PlayerInfoParamsSchema = Type.Object({
  uuid: Type.String()
})

// Connect

enum PlayerConnectError {
  USER_BANNED = "user-banned"
}

const PlayerConnectBodySchema = Type.Object({
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
  params: PlayerInfoParamsSchema,
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

// Get Player Info

export const PlayerInfoSchema: FastifySchema = {
  tags: ["players"],
  summary: "Get information about a player",
  security: [
    {
      bearerAuth: []
    }
  ],
  params: PlayerInfoParamsSchema,
  response: {
    200: Type.Ref(PlayerSchema),
    400: Type.Object({
      message: Type.String()
    })
  }
}

export type PlayerInfoParamsSchema = Static<typeof PlayerInfoParamsSchema>

// Get Permissions

export const PlayerGetPermissionsSchema: FastifySchema = {
  tags: ["players"],
  summary:
    "Get a player's permissions (also gets the permissions of their permission groups)",
  security: [
    {
      bearerAuth: []
    }
  ],
  params: PlayerInfoParamsSchema,
  response: {
    200: Type.Array(Type.String()),
    404: Type.Object({
      error: Type.String({ enum: ["player-not-found"] })
    })
  }
}

// Add Permission

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
  params: PlayerInfoParamsSchema,
  body: PlayerAddPermissionsBodySchema,
  response: {
    200: Type.Array(Type.String()),
    404: Type.Object({
      error: Type.String({ enum: ["player-not-found"] })
    })
  }
}

export type PlayerAddPermissionsBodySchema = Static<
  typeof PlayerAddPermissionsBodySchema
>

// Add Permission Group

const PlayerAddPermissionGroupBodySchema = Type.Object({
  groupName: Type.String()
})

export const PlayerAddPermissionGroupSchema: FastifySchema = {
  tags: ["players"],
  summary: "Add a permission group to a player",
  security: [
    {
      bearerAuth: []
    }
  ],
  params: PlayerInfoParamsSchema,
  body: PlayerAddPermissionGroupBodySchema,
  response: {
    200: Type.Object({})
  }
}

export type PlayerAddPermissionGroupBodySchema = Static<
  typeof PlayerAddPermissionGroupBodySchema
>

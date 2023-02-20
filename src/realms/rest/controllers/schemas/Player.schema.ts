import { FastifySchema } from "fastify"
import { Static, Type } from "@sinclair/typebox"
import PlayerSchema from "../../schemas/Player.schema"
import { ApiScope, ChatChannels } from "@prisma/client"

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
      apiKey: [ApiScope.PLAYERS, ApiScope.SERVER]
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
      apiKey: [ApiScope.PLAYERS]
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
      apiKey: [ApiScope.PLAYERS, ApiScope.PERMISSIONS]
    }
  ],
  params: PlayerInfoParamsSchema,
  response: {
    200: Type.Array(Type.String({ description: "The player's permissions" })),
    404: Type.Object({
      error: Type.String({ enum: ["player-not-found"] })
    })
  }
}

// Add Permission

const PlayerPermissionsBodySchema = Type.Object({
  permissions: Type.Array(Type.String())
})

export const PlayerAddPermissionsSchema: FastifySchema = {
  tags: ["players"],
  summary: "Add permissions to a player",
  security: [
    {
      apiKey: [ApiScope.PLAYERS, ApiScope.PERMISSIONS]
    }
  ],
  params: PlayerInfoParamsSchema,
  body: PlayerPermissionsBodySchema,
  response: {
    200: Type.Array(Type.String({ description: "The added permissions" })),
    404: Type.Object({
      error: Type.String({ enum: ["player-not-found"] })
    })
  }
}

export type PlayerPermissionsBodySchema = Static<
  typeof PlayerPermissionsBodySchema
>

// Remove Permissions

export const PlayerRemovePermissionsSchema: FastifySchema = {
  tags: ["players"],
  summary: "Remove permissions from a player",
  security: [
    {
      apiKey: [ApiScope.PLAYERS, ApiScope.PERMISSIONS]
    }
  ],
  params: PlayerInfoParamsSchema,
  body: PlayerPermissionsBodySchema,
  response: {
    200: Type.Array(Type.String({ description: "The removed permissions" })),
    404: Type.Object({
      error: Type.String({ enum: ["player-not-found"] })
    })
  }
}

// Add Permission Group

const PlayerAddPermissionGroupBodySchema = Type.Object({
  groupName: Type.String()
})

export const PlayerAddPermissionGroupSchema: FastifySchema = {
  tags: ["players"],
  security: [
    {
      apiKey: [ApiScope.PLAYERS, ApiScope.GROUPS]
    }
  ],
  summary: "Add a permission group to a player",
  params: PlayerInfoParamsSchema,
  body: PlayerAddPermissionGroupBodySchema,
  response: {
    200: Type.Object({})
  }
}

export type PlayerAddPermissionGroupBodySchema = Static<
  typeof PlayerAddPermissionGroupBodySchema
>

// Change Chat Channel

const PlayerChangeChannelBodySchema = Type.Object({
  channel: Type.String({
    enum: Object.keys(ChatChannels)
  })
})

export const PlayerChangeChannelSchema: FastifySchema = {
  tags: ["players"],
  security: [
    {
      apiKey: [ApiScope.PLAYERS, ApiScope.CHAT]
    }
  ],
  summary: "Change a player's chat channel",
  params: PlayerInfoParamsSchema,
  body: PlayerChangeChannelBodySchema,
  response: {
    200: Type.Object({}),
    404: Type.Object({
      error: Type.String({ enum: ["player-not-found", "invalid-channel"] })
    })
  }
}

export type PlayerChangeChannelBodySchema = Static<
  typeof PlayerChangeChannelBodySchema
>

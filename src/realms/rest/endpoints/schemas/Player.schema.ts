import { FastifySchema } from "fastify"
import { Static, Type } from "@sinclair/typebox"
import PlayerSchema from "../../schemas/Player.schema"
import { ApiScope, ChatChannels } from "@prisma/client"
import PermissionSchema from "../../schemas/Permission.schema"
import PermissionInputSchema from "../../schemas/PermissionInput.schema"

const PlayerCreateBodySchema = Type.Object({
  memberDiscordId: Type.String(),
  uuid: Type.String(),
  username: Type.String(),
  permGroups: Type.Array(Type.String())
})

export type PlayerCreateBodySchema = Static<typeof PlayerCreateBodySchema>

export const PlayerCreateSchema: FastifySchema = {
  tags: ["players"],
  summary: "Create a player entry",
  operationId: "createPlayer",
  security: [
    {
      apiKey: [ApiScope.PLAYERS]
    }
  ],
  body: PlayerCreateBodySchema,
  response: {
    200: Type.Ref(PlayerSchema)
  }
}

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
  operationId: "playerConnect",
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

// Disconnect

export const PlayerDisconnectSchema: FastifySchema = {
  tags: ["players"],
  summary: "A player disconnects from the server",
  operationId: "playerDisconnect",
  security: [
    {
      apiKey: [ApiScope.PLAYERS, ApiScope.SERVER]
    }
  ],
  params: PlayerInfoParamsSchema,
  response: {
    200: Type.Ref(PlayerSchema)
  }
}

// Get All Players

export const GetAllPlayersSchema: FastifySchema = {
  tags: ["players"],
  summary: "Get all players",
  operationId: "getAllPlayers",
  security: [
    {
      apiKey: [ApiScope.PLAYERS]
    }
  ],
  response: {
    200: Type.Array(Type.Ref(PlayerSchema))
  }
}

// Get Player Info

export const PlayerInfoSchema: FastifySchema = {
  tags: ["players"],
  summary: "Get information about a player",
  operationId: "getPlayerInfo",
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
  operationId: "getPlayerPermissions",
  security: [
    {
      apiKey: [ApiScope.PLAYERS, ApiScope.PERMISSIONS]
    }
  ],
  params: PlayerInfoParamsSchema,
  response: {
    200: Type.Array(Type.Ref(PermissionSchema)),
    404: Type.Object({
      error: Type.String({ enum: ["player-not-found"] })
    })
  }
}

// Add Permission

const PlayerPermissionsBodySchema = Type.Object({
  permissions: Type.Array(Type.Ref(PermissionInputSchema))
})

export const PlayerAddPermissionsSchema: FastifySchema = {
  tags: ["players"],
  summary: "Add permissions to a player",
  operationId: "addPlayerPermissions",
  security: [
    {
      apiKey: [ApiScope.PLAYERS, ApiScope.PERMISSIONS]
    }
  ],
  params: PlayerInfoParamsSchema,
  body: PlayerPermissionsBodySchema,
  response: {
    200: Type.Array(Type.Ref(PermissionSchema)),
    404: Type.Object({
      error: Type.String({ enum: ["player-not-found"] })
    })
  }
}

export type PlayerPermissionsBodySchema = Static<
  typeof PlayerPermissionsBodySchema
>

// Remove Permissions

const PlayerRemovePermissionsBodySchema = Type.Object({
  permissions: Type.Array(Type.String())
})

export type PlayerRemovePermissionsBodySchema = Static<
  typeof PlayerRemovePermissionsBodySchema
>

export const PlayerRemovePermissionsSchema: FastifySchema = {
  tags: ["players"],
  summary: "Remove permissions from a player",
  operationId: "removePlayerPermissions",
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

const PlayerPermissionGroupBodySchema = Type.Object({
  groupName: Type.String()
})

export const PlayerAddPermissionGroupSchema: FastifySchema = {
  tags: ["players"],
  summary: "Add a permission group to a player",
  operationId: "addPlayerPermissionGroup",
  security: [
    {
      apiKey: [ApiScope.PLAYERS, ApiScope.GROUPS]
    }
  ],
  params: PlayerInfoParamsSchema,
  body: PlayerPermissionGroupBodySchema,
  response: {
    200: Type.Object({})
  }
}

export type PlayerPermissionGroupBodySchema = Static<
  typeof PlayerPermissionGroupBodySchema
>

// Remove Permission Group

export const PlayerRemovePermissionGroupSchema: FastifySchema = {
  tags: ["players"],
  summary: "Remove a permission group from a player",
  operationId: "removePlayerPermissionGroup",
  security: [
    {
      apiKey: [ApiScope.PLAYERS, ApiScope.GROUPS]
    }
  ],
  params: PlayerInfoParamsSchema,
  body: PlayerPermissionGroupBodySchema,
  response: {
    200: Type.Object({})
  }
}

// Set Permission Groups

const PlayerPermissionGroupsBodySchema = Type.Object({
  groupNames: Type.Array(Type.String())
})

export type PlayerPermissionGroupsBodySchema = Static<
  typeof PlayerPermissionGroupsBodySchema
>

export const PlayerSetPermissionGroupsSchema: FastifySchema = {
  tags: ["players"],
  summary:
    "Set a player's permission groups (implies a removal of all unlisted groups)",
  operationId: "setPlayerPermissionGroups",
  security: [
    {
      apiKey: [ApiScope.PLAYERS, ApiScope.GROUPS]
    }
  ],
  params: PlayerInfoParamsSchema,
  body: PlayerPermissionGroupsBodySchema,
  response: {
    200: Type.Object({})
  }
}

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
  operationId: "changePlayerChannel",
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

// Change Server

const PlayerChangeServerBodySchema = Type.Object({
  serverName: Type.String()
})

export type PlayerChangeServerBodySchema = Static<
  typeof PlayerChangeServerBodySchema
>

export const PlayerChangeServerSchema: FastifySchema = {
  tags: ["players"],
  summary: "Change a player's server",
  operationId: "changePlayerServer",
  security: [
    {
      apiKey: [ApiScope.SERVER]
    }
  ],
  params: PlayerInfoParamsSchema,
  body: PlayerChangeServerBodySchema,
  response: {
    200: Type.Object({})
  }
}

// Get Online Players

export const PlayerGetOnlineSchema: FastifySchema = {
  tags: ["players"],
  summary: "Get a list of online players",
  operationId: "getOnlinePlayers",
  security: [
    {
      apiKey: [ApiScope.PLAYERS]
    }
  ],
  response: {
    200: Type.Array(Type.Ref(PlayerSchema))
  }
}

// Migrate Player

const PlayerMigrateBodySchema = Type.Object({
  uuid: Type.String(),
  username: Type.String()
})

export type PlayerMigrateBodySchema = Static<typeof PlayerMigrateBodySchema>

export const PlayerMigrateSchema: FastifySchema = {
  tags: ["players"],
  summary: "Migrate a player to a new UUID",
  operationId: "migratePlayer",
  security: [
    {
      apiKey: [ApiScope.PLAYERS]
    }
  ],
  body: PlayerMigrateBodySchema,
  params: PlayerInfoParamsSchema,
  response: {
    200: Type.Ref(PlayerSchema)
  }
}

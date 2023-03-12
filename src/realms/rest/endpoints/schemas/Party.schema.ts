import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { ApiScope } from "@prisma/client"
import PartySchema from "../../schemas/Party.schema"

export const GetPlayerParamsSchema = Type.Object({
  uuid: Type.String({ description: "The player's UUID" })
})

export type GetPlayerParamsSchema = Static<typeof GetPlayerParamsSchema>

// Get Party from Player UUID

export const GetPlayersPartySchema: FastifySchema = {
  tags: ["party"],
  summary: "Gets a player's party",
  operationId: "getPlayersParty",
  security: [
    {
      apiKey: [ApiScope.PARTIES]
    }
  ],
  params: GetPlayerParamsSchema,
  response: {
    200: Type.Optional(Type.Ref(PartySchema))
  }
}

// Create Party from Player UUID

export const CreatePlayersPartySchema: FastifySchema = {
  tags: ["party"],
  summary: "Creates a party for a player",
  operationId: "createPlayersParty",
  security: [
    {
      apiKey: [ApiScope.PARTIES]
    }
  ],
  params: GetPlayerParamsSchema,
  response: {
    200: Type.Ref(PartySchema)
  }
}

// Invite Player to Party

export const InvitePlayerToPartyBodySchema = Type.Object({
  uuid: Type.String({ description: "The player's or owner's UUID" })
})

export type InvitePlayerToPartyBodySchema = Static<
  typeof InvitePlayerToPartyBodySchema
>

export const InvitePlayerToPartySchema: FastifySchema = {
  tags: ["party"],
  summary: "Invites a player to a party",
  operationId: "invitePlayerToParty",
  security: [
    {
      apiKey: [ApiScope.PARTIES]
    }
  ],
  params: GetPlayerParamsSchema,
  body: InvitePlayerToPartyBodySchema,
  response: {
    200: Type.Ref(PartySchema)
  }
}

// Join Party

export const JoinPartySchema: FastifySchema = {
  tags: ["party"],
  summary: "Joins a party",
  operationId: "joinParty",
  security: [
    {
      apiKey: [ApiScope.PARTIES]
    }
  ],
  params: GetPlayerParamsSchema,
  body: InvitePlayerToPartyBodySchema,
  response: {
    200: Type.Ref(PartySchema)
  }
}

// Leave Party

export const LeavePartySchema: FastifySchema = {
  tags: ["party"],
  summary: "Leaves a party",
  operationId: "leaveParty",
  security: [
    {
      apiKey: [ApiScope.PARTIES]
    }
  ],
  params: GetPlayerParamsSchema,
  response: {
    200: Type.Ref(PartySchema)
  }
}

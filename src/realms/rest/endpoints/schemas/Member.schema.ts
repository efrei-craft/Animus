import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { ApiScope } from "@prisma/client"
import MemberSchema from "../../schemas/Member.schema"
import PlayerSchema from "../../schemas/Player.schema"

const MemberGetParamsSchema = Type.Object({
  discordId: Type.String()
})

export type MemberGetParamsSchema = Static<typeof MemberGetParamsSchema>

// Member Create

const MemberCreateBodySchema = Type.Object({
  discordId: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  promo: Type.Integer()
})

export type MemberCreateBodySchema = Static<typeof MemberCreateBodySchema>

export const MemberCreateSchema: FastifySchema = {
  tags: ["members"],
  summary: "Create an entry for a member of the Efrei Craft association",
  operationId: "createMember",
  security: [
    {
      apiKey: [ApiScope.MEMBERS]
    }
  ],
  body: MemberCreateBodySchema,
  response: {
    200: Type.Ref(MemberSchema)
  }
}

// Member Get

export const MemberGetSchema: FastifySchema = {
  tags: ["members"],
  summary: "Gets a member",
  operationId: "getMember",
  security: [
    {
      apiKey: [ApiScope.MEMBERS]
    }
  ],
  params: MemberGetParamsSchema,
  response: {
    200: Type.Ref(MemberSchema),
    404: Type.Object({
      error: Type.String({ enum: ["member-not-found"] })
    })
  }
}

// Member Get Player

export const MemberGetPlayerSchema: FastifySchema = {
  tags: ["members"],
  summary: "Gets a member's player",
  operationId: "getMemberPlayer",
  security: [
    {
      apiKey: [ApiScope.MEMBERS]
    }
  ],
  params: MemberGetParamsSchema,
  response: {
    200: Type.Object(Type.Ref(PlayerSchema))
  }
}

// Member Update

const MemberUpdateBodySchema = Type.Object({
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
  promo: Type.Optional(Type.Integer())
})

export type MemberUpdateBodySchema = Static<typeof MemberUpdateBodySchema>

export const MemberUpdateSchema: FastifySchema = {
  tags: ["members"],
  summary: "Update a member",
  operationId: "updateMember",
  security: [
    {
      apiKey: [ApiScope.MEMBERS]
    }
  ],
  params: MemberGetParamsSchema,
  body: MemberUpdateBodySchema,
  response: {
    200: Type.Ref(MemberSchema),
    404: Type.Object({
      error: Type.String({ enum: ["member-not-found"] })
    })
  }
}

// Member Remove

export const MemberRemoveSchema: FastifySchema = {
  tags: ["members"],
  summary: "Remove a member",
  operationId: "removeMember",
  security: [
    {
      apiKey: [ApiScope.MEMBERS]
    }
  ],
  params: MemberGetParamsSchema,
  response: {
    200: Type.String({ description: "The removed member's Discord ID" }),
    404: Type.Object({
      error: Type.String({ enum: ["member-not-found"] })
    })
  }
}

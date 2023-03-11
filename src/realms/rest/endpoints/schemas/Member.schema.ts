import { Static, Type } from "@sinclair/typebox"
import { FastifySchema } from "fastify"
import { ApiScope } from "@prisma/client"
import MemberSchema from "../../schemas/Member.schema"

const MemberCreateBodySchema = Type.Object({
  discordId: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  promo: Type.Integer(),
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

const MemberGetParamsSchema = Type.Object({
  discordId: Type.String()
})

export type MemberGetParamsSchema = Static<typeof MemberGetParamsSchema>

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
      error: Type.String({ enum: ["member-not-found"]})
    })
  }
}

const MemberUpdateParamsSchema = Type.Object({
  discordId: Type.String()
})

const MemberUpdateBodySchema = Type.Object({
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
  promo: Type.Optional(Type.Integer()),
})

export type MemberUpdateParamsSchema = Static<typeof MemberUpdateParamsSchema>
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
  params: MemberUpdateParamsSchema,
  body: MemberUpdateBodySchema,
  response: {
    200: Type.Ref(MemberSchema),
    404: Type.Object({
      error: Type.String({ enum: ["member-not-found"]})
    })
  }
}

const MemberRemoveParamsSchema = Type.Object({
  discordId: Type.String()
})
export type MemberRemoveParamsSchema = Static<typeof MemberRemoveParamsSchema>
export const MemberRemoveSchema: FastifySchema = {
  tags: ["members"],
  summary: "Remove a member",
  operationId: "removeMember",
  security: [
    {
      apiKey: [ApiScope.MEMBERS]
    }
  ],
  params: MemberRemoveParamsSchema,
  response: {
    200: Type.String({ description: "The removed member's Discord ID"}),
    404: Type.Object({
      error: Type.String({ enum: ["member-not-found"]})
    })
  }
}
import { Type } from "@sinclair/typebox"
import { PunishmentType } from "@prisma/client"
import PlayerSchema from "./Player.schema"

export default Type.Object(
  {
    id: Type.Integer({ description: "The ID of the punishment" }),
    type: Type.String({
      description: "The type of the punishment",
      enum: Object.keys(PunishmentType)
    }),
    reason: Type.String({ description: "The reason of the punishment" }),
    punisher: Type.Ref(PlayerSchema),
    expires: Type.String({
      description: "The date when the punishment expires"
    })
  },
  { $id: "Punishment", description: "The schema describing a punishment" }
)

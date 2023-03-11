import { Type } from "@sinclair/typebox"
import PlayerSchema from "./Player.schema"

export default Type.Object(
  {
    discordId: Type.String({ description: "The member's Discord ID" }),
    firstName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
    promo: Type.Optional(Type.Integer()),
    player: Type.Optional(Type.Ref(PlayerSchema))
  },
  {
    $id: "Member",
    description: "The schema describing a member of the Efrei Craft association"
  }
)

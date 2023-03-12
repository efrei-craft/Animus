import { Type } from "@sinclair/typebox"
import PlayerSchema from "./Player.schema"

export default Type.Object(
  {
    id: Type.Integer({ description: "The party's ID" }),
    name: Type.String({ description: "The party's name" }),
    owner: Type.Ref(PlayerSchema),
    members: Type.Array(Type.Ref(PlayerSchema), {
      description: "The members of this party"
    }),
    invited: Type.Array(Type.Ref(PlayerSchema), {
      description: "The players invited to this party"
    }),
    public: Type.Boolean({ description: "Whether or not this party is public" })
  },
  {
    $id: "Party",
    description: "The schema describing a party"
  }
)

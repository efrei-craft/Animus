import { Type } from "@sinclair/typebox"
import PermGroupSchema from "./PermGroup.schema"

export default Type.Object(
  {
    uuid: Type.String(),
    username: Type.String(),
    permGroups: Type.Array(Type.Ref(PermGroupSchema)),
    _count: Type.Object({
      friends: Type.Number()
    }),
    discordUserId: Type.String(),
    lastSeen: Type.String()
  },
  { $id: "Player" }
)

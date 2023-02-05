import { Type } from "@sinclair/typebox"
import PermGroupSchema from "./PermGroup.schema"

const PermGroupSchemaWithoutPermissions = Type.Omit(PermGroupSchema, [
  "permissions",
  "parentGroupId",
  "defaultGroup"
])
PermGroupSchemaWithoutPermissions.$id = "PermGroupPlayer"
PermGroupSchemaWithoutPermissions.description =
  "A minimal permission group schema for players"

export default Type.Object(
  {
    uuid: Type.String({ description: "The player's Minecraft UUID" }),
    username: Type.String({ description: "The player's Minecraft username" }),
    permGroups: Type.Array(PermGroupSchemaWithoutPermissions, {
      description: "The player's permission groups"
    }),
    discordUserId: Type.Optional(
      Type.String({ description: "The player's Discord user ID" })
    ),
    lastSeen: Type.String({
      description: "The date the player was last seen in game"
    })
  },
  {
    $id: "Player",
    description: "The schema describing a player"
  }
)

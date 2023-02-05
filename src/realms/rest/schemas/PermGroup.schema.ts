import { Type } from "@sinclair/typebox"
import PermissionSchema from "./Permission.schema"

export default Type.Object(
  {
    id: Type.Number({ description: "The permission group's ID" }),
    name: Type.String({ description: "The permission group's technical name" }),
    permissions: Type.Array(Type.Ref(PermissionSchema), {
      description: "The permissions this group has"
    }),
    prefix: Type.String({
      description: "The prefix this group has, shown in game (chat, tab etc)"
    }),
    color: Type.String({
      description:
        "The color this group has, shown in game and formatted with an ampersand (&)",
      examples: ["&c", "&a", "&b"]
    }),
    bold: Type.Boolean({
      description: "Whether or not this group's prefix is bold"
    }),
    priority: Type.Number({
      description:
        "The priority this group has (used for tab sorting and priority picking)"
    }),
    defaultGroup: Type.Boolean({
      description: "Whether or not this group is a default group"
    }),
    parentGroupId: Type.Number({ description: "The ID of the parent group" })
  },
  {
    $id: "PermGroup",
    description: "The schema describing a permission group (ranks)"
  }
)

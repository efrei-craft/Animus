import { Type } from "@sinclair/typebox"
import PermissionSchema from "./PermissionInput.schema"

export default Type.Object(
  {
    name: Type.String({ description: "The permission group's technical name" }),
    permissions: Type.Array(Type.Ref(PermissionSchema), {
      description: "The permissions this group has"
    }),
    prefix: Type.String({
      description: "The prefix this group has, shown in game (chat, tab etc)"
    }),
    color: Type.String({
      description:
        "The color this group has, shown in game and formatted with an ampersand (&)"
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
    parentGroupName: Type.String({
      description: "The name of the parent group"
    })
  },
  {
    $id: "PermGroup",
    description: "The schema describing a permission group (ranks)"
  }
)

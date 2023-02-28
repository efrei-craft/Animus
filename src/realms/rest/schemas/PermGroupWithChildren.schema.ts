import { Type } from "@sinclair/typebox"
import PermGroupSchema from "./PermGroup.schema"

export default Type.Object(
  {
    group: Type.Ref(PermGroupSchema),
    children: Type.Array(Type.Ref(PermGroupSchema), {
      description: "The children of this group"
    })
  },
  {
    $id: "PermGroupWithChildren",
    description: "A permission group with its children"
  }
)

import { Type } from "@sinclair/typebox"
import PermGroupSchema from "./PermGroup.schema"

const PermGroupPlayer = Type.Omit(PermGroupSchema, [
  "permissions",
  "parentGroupName",
  "defaultGroup"
])
PermGroupPlayer.$id = "PermGroupPlayer"
PermGroupPlayer.description = "A minimal permission group schema for players"

export default PermGroupPlayer

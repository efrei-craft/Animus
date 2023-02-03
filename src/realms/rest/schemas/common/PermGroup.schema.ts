import { Type } from '@sinclair/typebox';
import PermissionSchema from "./Permission.schema";

export default Type.Object({
  id: Type.Number(),
  name: Type.String(),
  permissions: Type.Array(Type.Ref(PermissionSchema)),
  prefix: Type.String(),
  color: Type.String(),
  bold: Type.Boolean(),
  parentGroupId: Type.Number(),
}, { $id: 'PermGroup' });
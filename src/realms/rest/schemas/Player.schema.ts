import { Type } from "@sinclair/typebox"
import { ChatChannels } from "@prisma/client"
import PermGroupPlayer from "./PermGroupPlayer.schema"
import PermissionSchema from "./Permission.schema";
import PunishmentSchema from "./Punishment.schema"

export default Type.Object(
  {
    uuid: Type.String({ description: "The player's Minecraft UUID" }),
    username: Type.String({ description: "The player's Minecraft username" }),
    perms: Type.Array(Type.Ref(PermissionSchema)),
    permGroups: Type.Array(Type.Ref(PermGroupPlayer)),
    lastSeen: Type.String({
      description: "The date the player was last seen in game (ISO 8601)"
    }),
    chatChannel: Type.String({
      description: "The player's chat channel",
      enum: Object.keys(ChatChannels)
    }),
    serverName: Type.Optional(
      Type.String({ description: "The player's server name" })
    ),
    memberDiscordId: Type.Optional(
      Type.String({ description: "The player's Discord ID" })
    ),
    punishments: Type.Array(Type.Ref(PunishmentSchema)),
  },
  {
    $id: "Player",
    description: "The schema describing a player"
  }
)

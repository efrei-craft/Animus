import { Type } from "@sinclair/typebox"
import { ChatChannels } from "@prisma/client"
import PermGroupPlayer from "./PermGroupPlayer.schema"

export default Type.Object(
  {
    uuid: Type.String({ description: "The player's Minecraft UUID" }),
    username: Type.String({ description: "The player's Minecraft username" }),
    permGroups: Type.Array(Type.Ref(PermGroupPlayer)),
    discordUserId: Type.Optional(
      Type.String({ description: "The player's Discord user ID" })
    ),
    lastSeen: Type.String({
      description: "The date the player was last seen in game (ISO 8601)"
    }),
    chatChannel: Type.String({
      description: "The player's chat channel",
      enum: Object.keys(ChatChannels)
    }),
    serverName: Type.Optional(
      Type.String({ description: "The player's server name" })
    )
  },
  {
    $id: "Player",
    description: "The schema describing a player"
  }
)

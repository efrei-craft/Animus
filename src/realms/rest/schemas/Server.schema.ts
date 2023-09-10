import { Type } from "@sinclair/typebox"
import TemplateSchema from "./Template.schema"
import PlayerSchema from "./Player.schema"
import GameServerSchema from "./GameServer.schema"

export default Type.Object(
  {
    name: Type.String({ description: "The server's name" }),
    template: Type.Ref(TemplateSchema, {
      description: "The server's template"
    }),
    address: Type.Optional(
      Type.String({ description: "The server's address within the network" })
    ),
    players: Type.Array(Type.Ref(PlayerSchema), {
      description: "The server's players"
    }),
    maxPlayers: Type.Number({
      description: "The server's maximum player count",
      default: 16
    }),
    ready: Type.Boolean({
      description: "Whether the server is ready",
      default: false
    }),
    permanent: Type.Boolean({
      description: "Whether the server is permanent",
      default: false
    }),
    lastPlayerUpdate: Type.String({
      description: "The server's last player update (ISO 8601)",
      default: new Date().toISOString()
    }),
    createdAt: Type.String({
      description: "The server's creation date (ISO 8601)",
      default: new Date().toISOString()
    }),
    updatedAt: Type.String({
      description: "The server's last update date (ISO 8601)",
      default: new Date().toISOString()
    }),
    gameServer: Type.Optional(
      Type.Ref(GameServerSchema, {
        description: "The server's game server"
      })
    )
  },
  {
    $id: "Server",
    description: "The schema describing a server"
  }
)

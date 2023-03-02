import { Type } from "@sinclair/typebox"
import GameSchema from "./Game.schema"

export default Type.Object(
  {
    serverName: Type.String({ description: "The server's name" }),
    game: Type.Optional(Type.Ref(GameSchema)),
    requestedGameName: Type.Optional(
      Type.String({ description: "The default game for the server" })
    ),
    status: Type.String({ description: "The server's status" })
  },
  {
    $id: "GameServer",
    description: "The schema describing a game server"
  }
)

import { Type } from "@sinclair/typebox"
import GameSchema from "./Game.schema"

export default Type.Object(
  {
    serverName: Type.String({ description: "The server's name" }),
    game: Type.Optional(Type.Ref(GameSchema)),
    status: Type.String({ description: "The server's status" })
  },
  {
    $id: "GameServer",
    description: "The schema describing a game server"
  }
)

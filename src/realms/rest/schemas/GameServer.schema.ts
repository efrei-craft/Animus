import { Type } from "@sinclair/typebox"
import GameSchema from "./Game.schema"
import { TypeNullUnion } from "../helpers/TypeNullUnion"

export default Type.Object(
  {
    serverName: Type.String({ description: "The server's name" }),
    game: TypeNullUnion(Type.Ref(GameSchema)),
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

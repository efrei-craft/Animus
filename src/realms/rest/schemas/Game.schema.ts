import { Type } from "@sinclair/typebox"
import { Template } from "@prisma/client"

export default Type.Object(
  {
    name: Type.String({
      description: "The name of the game"
    }),
    color: Type.String({
      description: "The color of the game (amp color code)"
    }),
    ludosGame: Type.String({
      description: "The name of the game in Ludos"
    }),
    menuMaterial: Type.String({
      description: "The material of the game (menu)"
    }),
    menuDescription: Type.String({
      description: "The description of the game (menu)"
    }),
    menuOrder: Type.Number({
      description: "The order of the game (menu)"
    }),
    minQueueToStart: Type.Number({
      description: "The minimum amount of players in the queue to start a game"
    }),
    maxPlayers: Type.Number({
      description: "The maximum amount of players for the game"
    }),
    template: Type.String({
      enum: Object.keys(Template)
    }),
    available: Type.Boolean({
      description: "Whether the game is available"
    })
  },
  { $id: "Game", description: "The schema describing a game" }
)

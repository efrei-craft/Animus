import { Type } from "@sinclair/typebox"

export default Type.Object(
  {
    name: Type.String({
      description: "The name of the game"
    }),
    online: Type.Number({
      description: "The number of players online in the game"
    })
  },
  { $id: "PlayerCount", description: "The schema describing a player count" }
)

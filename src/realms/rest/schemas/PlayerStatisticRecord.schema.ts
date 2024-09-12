import { Type } from "@sinclair/typebox"

export default Type.Object(
  {
    key: Type.String({ description: "The key of the statistic" }),
    displayName: Type.String({
      description: "The display name of the statistic"
    }),
    color: Type.String({ description: "The color of the statistic" }),
    value: Type.Number({ description: "The aggregated value of the statistic" })
  },
  {
    $id: "PlayerStatisticRecord",
    description: "The schema describing a player statistic record"
  }
)

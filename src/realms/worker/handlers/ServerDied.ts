import { WorkerMethod } from "../types"

export const method: WorkerMethod = {
  exec: async (arg: string) => {
    console.log("ServerDied.ts: " + arg)
  },
  meta: {
    queueType: "set"
  }
}

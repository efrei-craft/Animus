import { WorkerMethod } from "../types"
import { AnimusWorker } from "../index"

export const method: WorkerMethod = {
  exec: async () => {
    await AnimusWorker.getInstance().insertIntoQueue(
      "CreateServer",
      "proxy.dev"
    )
    await AnimusWorker.getInstance().insertIntoQueue(
      "CreateServer",
      "lobby.dev"
    )
    await AnimusWorker.getInstance().insertIntoQueue("CreateServer", "mini.dev")
  },
  meta: {
    queueType: "list"
  }
}

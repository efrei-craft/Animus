type WorkerMethod = {
  exec: (arg: string) => Promise<void>
  meta: Partial<WorkerMethodMeta>
}

type WorkerMethodMeta = {
  name: string
  queueType: "list" | "set"
}

export { WorkerMethod, WorkerMethodMeta }

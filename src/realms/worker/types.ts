type WorkerMethod = {
  exec: (args: string[]) => Promise<void>
  meta: Partial<WorkerMethodMeta>
}

enum DockerHookType {
  DIE = "die",
  KILL = "kill",
  DESTROY = "destroy"
}

type WorkerMethodMeta = {
  name: string
  queueType: "list" | "set"
  hooks: {
    docker: DockerHookType[] | null
  } | null
}

export { WorkerMethod, WorkerMethodMeta, DockerHookType }

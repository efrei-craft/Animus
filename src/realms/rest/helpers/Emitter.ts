export type Emitter<T extends { type: string; payload?: any }> = {
  emit<K extends T["type"]>(
    type: K,
    payload: Extract<T, { type: K }> extends { type: K }
      ? Extract<T, { type: K }>["payload"]
      : never
  ): boolean
  on<K extends T["type"]>(
    type: K,
    listener: (
      payload: Extract<T, { type: K }> extends { type: K }
        ? Extract<T, { type: K }>["payload"]
        : never
    ) => void
  ): void
  off<K extends T["type"]>(
    type: K,
    listener: (
      payload: Extract<T, { type: K }> extends { type: K }
        ? Extract<T, { type: K }>["payload"]
        : never
    ) => void
  ): void
  once<K extends T["type"]>(
    type: K,
    listener: (
      payload: Extract<T, { type: K }> extends { type: K }
        ? Extract<T, { type: K }>["payload"]
        : never
    ) => void
  ): void
  removeAllListeners<K extends T["type"]>(type?: K): void
  setMaxListeners(n: number): void
}

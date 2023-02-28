import Redis from "ioredis"

export default class RedisClient {
  private static SEPARATOR = "##"

  private _client: Redis

  private static instance: RedisClient

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public async publishToPlugin(
    channel: string,
    plugin: string,
    method: string,
    arg: string
  ) {
    await this.client.publish(
      channel,
      plugin + RedisClient.SEPARATOR + method + RedisClient.SEPARATOR + arg
    )
  }

  get client(): Redis {
    if (!this._client) {
      this._client = new Redis({
        db: 0,
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
        port: Number(process.env.REDIS_PORT)
      })
    }
    return this._client
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient()
    }
    return RedisClient.instance
  }
}

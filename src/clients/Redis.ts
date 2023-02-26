import Redis from "ioredis"

const redis = new Redis({
  db: 0,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  port: Number(process.env.REDIS_PORT)
})

export default redis

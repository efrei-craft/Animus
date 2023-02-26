const NEEDED_ENV = [
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_PASSWORD",
  "REDIS_DB",
  "API_HOST"
]

function getNeededVars() {
  return NEEDED_ENV.map((key) => `${key}=${process.env[key]}`)
}

export { getNeededVars }

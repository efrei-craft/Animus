function generateRandomId(): string {
  const randomNumber = Math.floor(Math.random() * (1000 - 100) + 100)
  const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26))

  return `${randomNumber}${randomLetter}`
}

const serverNameGenerator = function (template: string): string {
  const infrastructure = process.env.INFRASTRUCTURE_NAME

  const randomId = generateRandomId()
  return `${infrastructure}.${template}${randomId}`
}

export { serverNameGenerator }

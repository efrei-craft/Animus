import Docker from "dockerode"

const docker = new Docker({
  socketPath: "/var/run/docker.sock"
})

export const dockerAuth = {
  serveraddress: process.env.DOCKER_REGISTRY,
  username: process.env.DOCKER_USERNAME,
  password: process.env.DOCKER_PASSWORD
}

export default docker

import {ServerRoute} from "@hapi/hapi";

export const routes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/players',
    handler: (request, h) => {
      return 'Hello World!';
    }
  }
]
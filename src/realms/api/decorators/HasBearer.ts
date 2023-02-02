import {FastifyRequest} from "fastify";
import {RouteGenericInterface} from "fastify/types/route";
import {ApiKey, bearerToken} from "../helpers/Auth";

export interface RequestWithKey<RouteGeneric extends RouteGenericInterface = {}> extends FastifyRequest<RouteGeneric> {
  key: ApiKey;
}

export function HasBearer() {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0] as RequestWithKey;
      const res = args[1];
      const auth = req.headers.authorization;
      try {
        req.key = await bearerToken(auth);
      } catch (e: any) {
        return res.status(401).send({
          error: e.message,
          statusCode: 401
        })
      }

      return originalMethod.apply(this, args);
    }
  };
}

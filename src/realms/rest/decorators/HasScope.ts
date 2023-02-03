import {scopeToken} from "../helpers/Auth";
import {RequestWithKey} from "./HasBearer";
import {ApiScope} from "@prisma/client";

export function HasScope({scopes = []}: { scopes?: ApiScope[] } = {
  scopes: [],
}) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0] as RequestWithKey
      const res = args[1];

      try {
        if (req.key) {
          scopeToken(scopes, req.key);
        } else {
          throw new Error("no_api_key")
        }
      } catch(e: any) {
        return res.status(401).send({
          error: e.message,
          statusCode: 401
        })
      }

      return originalMethod.apply(this, args);
    }
  };
}

// trpc 
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import superjson from 'superjson';
import { OpenApiMeta } from 'trpc-openapi';
export const createContext = ({
    req,
    res,
}: CreateExpressContextOptions) => ({ req, res });

export type trpcContextType = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC
    .meta<OpenApiMeta>()
    .create({
        transformer: superjson,
    });


export const trpcRouter = t.router;



export const trpcProcedure = t.procedure;
export const trpcMiddleware = t.middleware;








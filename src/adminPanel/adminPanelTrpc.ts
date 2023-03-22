import { trpcProcedure } from "../trpc.js";
import { verifyAdminAccessTokenMiddleware } from "./middlewares/jwt.js";




export const adminPanelPublicProcedure = trpcProcedure;

export const adminPanelUserProcedure = adminPanelPublicProcedure.use(verifyAdminAccessTokenMiddleware);
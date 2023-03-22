import { trpcProcedure } from "../trpc.js";
import { verifyMasterAccessTokenMiddleware } from "./middlewares/jwt.js";



export const masterPanelPublicProcedure = trpcProcedure;

export const masterPanelUserProcedure = masterPanelPublicProcedure.use(verifyMasterAccessTokenMiddleware);
import { t } from "../trpc.js";
import { validateAppUsernameMiddleware } from "./middlewares/appUsername.js";
import { verifyUserAccessTokenMiddleware } from "./middlewares/jwt.js";






export const webAppPublicProcedure = t.procedure.use(validateAppUsernameMiddleware);
export const webAppUserProcedure = webAppPublicProcedure.use(verifyUserAccessTokenMiddleware);
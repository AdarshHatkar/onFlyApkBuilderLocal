
import { adminPanelRouter } from "./adminPanel/adminPanel.js";
import { masterPanelRouter } from "./masterPanel/masterPanel.js";
import { trpcRouter } from "./trpc.js";
import { webAppRouter } from "./webApp/webApp.js";





export const mainRouter = trpcRouter({


    webApp: webAppRouter,
    masterPanel: masterPanelRouter,
    adminPanel: adminPanelRouter,


});
import express, { Request, Response } from 'express';
import createHttpError from 'http-errors';
import si from 'systeminformation';
import { adminPanelRoute } from './adminPanel/adminPanel.js';
import { initCronJobs } from './globalHelpers/cronJob.js';
import { httpErrorHandler } from './globalMiddlewares/httpErrorHandler.js';
import { masterPanelRoute } from './masterPanel/masterPanel.js';
import { webAppRoute } from './webApp/webApp.js';

import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import morgan from 'morgan';
import { mainRouter } from './mainRouter.js';
import { createContext } from './trpc.js';
import { exec } from 'node:child_process';

const app = express();
export const port = process.env.APP_PORT || 3010;


// Root middle wares 
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev', {
  skip: function (req: Request, res: Response) {
    // logging particular requests 
    let isSkipping = false

    // res.statusCode < 400

    // if (res.statusCode == 200 || res.statusCode == 304 || res.statusCode == 401) {
    //   isSkipping = true
    // }
    return isSkipping
  }
}));

// monitoring middleware




app.get('/', (req, res) => {

  res.json({
    status: 'success',
    msg: 'Welcome to on_fly_apk_builder_local'
  });
});




console.log("hello world");

exec('gradle --version', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }

  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});






// initiating control panel routes
// app.use('/masterPanel', masterPanelRoute);

// initiating admin panel routes
// app.use('/adminPanel', adminPanelRoute);

// initiating Web app routes
// app.use('/webApp', webAppRoute);







// Handle Master Panel tRPC requests
// app.use("/trpc/masterPanel", createExpressMiddleware({ router: mainRouter.masterPanel, createContext }));
// Handle Admin Panel tRPC requests
// app.use("/trpc/adminPanel", createExpressMiddleware({ router: mainRouter.adminPanel, createContext }));
// Handle incoming tRPC requests
// app.use("/trpc/webApp/:appUsername", createExpressMiddleware({ router: mainRouter.webApp, createContext }));
//  http://192.168.100.9:3005/trpcPublic/webApp/my_tournament/basic/customerSupport

// Handle incoming OpenAPI requests

// app.use('/trpcPublic/webApp/:appUsername', createOpenApiExpressMiddleware({ router: mainRouter.webApp, createContext }));

// app.use('/trpcPublic/masterPanel', createOpenApiExpressMiddleware({ router: mainRouter.masterPanel, createContext }));

// Serve Swagger UI with our OpenAPI schema
// app.use('/webAppDoc', swaggerUi.serve);
// app.get('/webAppDoc', swaggerUi.setup(openApiDocumentWebApp));




// initializing cron  

// initCronJobs();







// 404 routes handling
app.use(async (req, res, next) => {
  next(createHttpError.NotFound());
});


app.use(httpErrorHandler);


app.listen(port, async () => {
  const networkInterfaces = await si.networkInterfaces();
  // const cpu = await si.cpu();
  // console.log(`Cores : ${cpu.cores}`);
  console.log(`Link:http://${networkInterfaces[0].ip4}:${port}`);
  console.log('\x1b[32m', `on_fly_apk_builder_local is Running 👍 `);


});  
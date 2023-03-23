import express from 'express';
import createHttpError from 'http-errors';
import si from 'systeminformation';

import cors from 'cors';
import morgan from 'morgan';
import { mainFun } from './mainFun.js';
const app = express();
export const port = process.env.APP_PORT || 3010;
// Root middle wares 
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev', {
    skip: function (req, res) {
        // logging particular requests 
        let isSkipping = false;
        // res.statusCode < 400
        // if (res.statusCode == 200 || res.statusCode == 304 || res.statusCode == 401) {
        //   isSkipping = true
        // }
        return isSkipping;
    }
}));

// monitoring middleware
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        msg: 'Welcome to on_fly_apk_builder_local'
    });
});
mainFun();

// 404 routes handling
app.use(async (req, res, next) => {
    next(createHttpError.NotFound());
});

app.listen(port, async () => {
    const networkInterfaces = await si.networkInterfaces();
    // const cpu = await si.cpu();
    // console.log(`Cores : ${cpu.cores}`);
    console.log(`Link:http://${networkInterfaces[0].ip4}:${port}`);
    console.log( `on_fly_apk_builder_local is Running 👍 `);
});

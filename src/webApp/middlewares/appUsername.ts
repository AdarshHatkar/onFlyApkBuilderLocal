import { TRPCError } from "@trpc/server";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import myPrisma from '../../globalHelpers/myPrisma.js';
import { convertToInt } from "../../globalHelpers/utility.js";
import { t } from "../../trpc.js";


let appDataSchema = z.object({
    appUsername: z.string().min(1),
    ownerId: z.number()
})

export type appDataType = z.infer<typeof appDataSchema>

export const validateAppUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { appUsername } = req.params;

        const appDetails = await myPrisma.web_app_details.findFirst({
            where: {
                username: appUsername
            }
        });

        if (!appDetails) {
            return res.json({
                status: 'invalidAppUsername',
                msg: `Invalid Link `
            });
        }
        let appData = await appDataSchema.parseAsync({
            appUsername,
            ownerId: convertToInt(appDetails.ownerId)
        })
        req.appData = appData
        next();
    } catch (error) {
        console.log(error);
        return res.status(422).json(error);
    }




};

export const validateAppUsernameMiddleware = t.middleware(async ({ ctx, next }) => {
    try {
        //@ts-ignore
        const { appUsername } = ctx?.req.params;

        const appDetails = await myPrisma.web_app_details.findFirst({
            where: {
                username: appUsername
            }
        });

        if (!appDetails) {

            throw "invalidAppUsername"

        }
        let appData = await appDataSchema.parseAsync({
            appUsername,
            ownerId: convertToInt(appDetails.ownerId)
        })


        return next({
            ctx: {
                appData: appData,
            },
        });
    } catch (error) {

        if (error == "invalidAppUsername") {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'invalidAppUsername', cause: 'invalidAppUsernameCause' });
        } else {
            console.log(error);
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: 'try catch ' });
        }

    }

});
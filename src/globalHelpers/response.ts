import { Response } from "express";



export let errorResponse = (res: Response, msg: string) => {

    return res.json({
        status: 'error',
        msg
    })
}
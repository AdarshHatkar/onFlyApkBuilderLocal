
import { NextFunction, Request, Response } from "express";
export const httpErrorHandler = (err, req: Request, res: Response, next: NextFunction) => {

  res.status(err.status || 500);
  res.json({
    error: {
      status: err.status || 500,
      message: err.message || 'Internal Server Error 😥'
    }
  });
  next();
};
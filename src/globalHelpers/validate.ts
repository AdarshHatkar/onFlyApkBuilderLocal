import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";





import { validationResult } from 'express-validator';





export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};



const validateWithZod =
  (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        return next();
      } catch (error) {
        return res.status(422).json(error);
      }
    };

export const validateBody =
  (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync({ ...req.body });
        return next();
      } catch (error) {
        return res.status(422).json(error);
      }
    };
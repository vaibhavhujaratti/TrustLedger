import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validateBody = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error); // Caught by global error handler
      } else {
        next(new Error("Unknown validation error"));
      }
    }
  };
};

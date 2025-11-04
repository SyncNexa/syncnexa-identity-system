import type { Request, Response, NextFunction } from "express";
import { createNewUser } from "../models/user.model.js";
import { sendSuccess } from "../utils/success.js";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await createNewUser(req.body);
    if (result) {
      sendSuccess(201, "User created successfully!", res, result);
    } else {
      throw new Error("Could not create account, please try again.");
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
}

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt";

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        req.user = verifyAccessToken(token);
        return next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired access token" });
    }
}
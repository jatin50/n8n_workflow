import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { setAuthCookies, clearAuthCookies } from "../lib/cookies";

export async function register(req: Request, res: Response) {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
        return res.status(400).json({ error: "name, email, and password are required" });
    }
    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ error: "password must be at least 8 characters" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { name, email, password: passwordHash },
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email },
    });
}

export async function login(req: Request, res: Response) {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Deliberately the same error as a wrong password below, so we don't
        // leak which emails are registered.
        return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
        user: { id: user.id, name: user.name, email: user.email },
    });
}

export async function logout(_req: Request, res: Response) {
    clearAuthCookies(res);
    return res.status(204).send();
}

export async function me(req: Request, res: Response) {
    // req.user is attached by the authenticate middleware — see auth.middleware.ts
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
}

export async function refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) {
        return res.status(401).json({ error: "No refresh token provided" });
    }

    try {
        const payload = verifyRefreshToken(token);
        const accessToken = signAccessToken({ userId: payload.userId, email: payload.email });

        // NOTE: this reissues only the access token, keeping the existing
        // refresh token as-is until it naturally expires. A production system
        // would typically rotate the refresh token too and track it in the DB
        // so a single stolen refresh token can be revoked early — that's a
        // reasonable "what I'd add next" if this comes up in an interview.
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
            path: "/",
        });

        return res.json({ ok: true });
    } catch {
        clearAuthCookies(res);
        return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
}
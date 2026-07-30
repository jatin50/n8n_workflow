import { Response } from "express";

const isProd = process.env.NODE_ENV === "production";

// 15 minutes / 7 days in milliseconds, kept here (not read from the JWT
// expiry strings) so the cookie's browser-side expiry matches the token's
// actual signed expiry without re-parsing "15m"/"7d" strings.
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: ACCESS_TOKEN_MAX_AGE,
        path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: "/",
    });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
}
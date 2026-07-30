import { TokenPayload } from "../lib/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export { };
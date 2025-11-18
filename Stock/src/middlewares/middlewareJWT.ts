import jwt from "jsonwebtoken";


const SECRET_KEY = process.env.JWT_SECRET || 'stock'
const EXPIRES_IN = '1h'

interface JwtPayloadWithUserId extends jwt.JwtPayload {
    id_user: number;
}

export class TokenJWT {
    static generateToken(payload: { id_user: number }): string {
        return jwt.sign(payload, SECRET_KEY, {
            expiresIn: EXPIRES_IN,
        });
    }

    static verifyToken(token: string): JwtPayloadWithUserId | null {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);

            if (typeof decoded === 'object' && decoded !== null && 'id_user' in decoded) {
                return decoded as JwtPayloadWithUserId;
            }

            return null;
        } catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
    }
}

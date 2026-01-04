import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';


export const signToken = (payload) => {
    return jsonwebtoken.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    })
}

export const verifyToken = (token) => {
    return jsonwebtoken.verify(token, JWT_SECRET)
}
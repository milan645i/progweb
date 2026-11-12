import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

export const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: "Accès refusé, token manquant ou mal formaté" });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();

    } catch (err) {
        return res.status(401).json({ success: false, message: "Token invalide ou expiré" });
    }
};
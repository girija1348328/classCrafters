// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'a_secret_12345';

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];

        jwt.verify(bearerToken, JWT_SECRET, (err, authData) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
            }
            req.user = authData;
            next();
        });
    } else {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
}


function authorizeRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Forbidden: User role not found.' });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action.' });
        }
        next();
    };
}

module.exports = { verifyToken, authorizeRole };
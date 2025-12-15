const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log("Verifying with secret:", process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) + '...' : 'UNDEFINED');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        // Allow ADMIN to access everything or check specific permission
        if (req.user && (req.user.role === 'ADMIN' || req.user.permissions?.includes(requiredPermission))) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
    };
};

module.exports = { protect, checkPermission };

const jwt = require('jsonwebtoken');

const authMiddleware = (roles) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Access denied, no token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Check if user role is allowed
            if (roles.includes("self") && req.user.id === req.params.id) {
                return next();
            }

            if (roles.includes(req.user.role)) {
                return next();
            }
            return res.status(403).json({ message: 'Access denied, insufficient permissions' });
        } catch (error) {
            res.status(400).json({ message: 'Invalid token', error: error.message });
        }
    }
}

module.exports = authMiddleware;
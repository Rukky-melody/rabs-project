const jwt = require('jsonwebtoken');

exports.verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "No token provided, authorization denied." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ensure user is an admin
        if (decoded.role !== 'admin' && decoded.role !== 'Admin') {
            return res.status(403).json({ success: false, message: "Access denied. Admin privileges required." });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    console.log("Signing with secret:", process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) + '...' : 'UNDEFINED');
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

module.exports = generateToken;

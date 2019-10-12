const jwt = require('jsonwebtoken');
const config = require('config');
const secret = config.get('TOKEN_SECRET.token');

const verifyAuth = (req, res, next) => {
    const token = req.header('auth-token');

    if(!token) return res.status(401).send('Invalid permissions: Forbidden');

    try {
        let verified = jwt.verify(token, secret);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
}

module.exports = verifyAuth;
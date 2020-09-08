/** dependencies */
const jwt    = require('jsonwebtoken');
const utils  = require('./utils');
/** environment variable */
const JWT_SECRET_KEY      = process.env.JWT_SECRET_KEY;
const JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME

class Authorization {
    /**
     * 
     * @param {Object} params, that need to encode to jwt 
     * @return {String} token, JWT
     */
    generateToken (params) {
        if (!utils.isObject(params)) {
            throw new Error("Invalid parameter");
        }
        const token = jwt.sign(params, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRATION_TIME });
        return token;
    }
}

module.exports = Authorization;
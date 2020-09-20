/** dependencies */
const jwt    = require('jsonwebtoken');
const utils  = require('./utils');
/** environment variable */
const JWT_ACCESS_SECRET_KEY      = process.env.JWT_ACCESS_SECRET_KEY;
const JWT_ACCESS_EXPIRATION_TIME = process.env.JWT_ACCESS_EXPIRATION_TIME;
const JWT_REFRESH_SECRET_KEY      = process.env.JWT_REFRESH_SECRET_KEY;
const JWT_REFRESH_EXPIRATION_TIME = process.env.JWT_REFRESH_EXPIRATION_TIME

class Oauth {
    /**
     * 
     * @param {Object} params, that need to encode to jwt 
     * @return {String} token, JWT
     */
    generateAccessToken (params) {
        if (!utils.isObject(params)) {
            throw new Error("Invalid parameter");
        }
        const token = jwt.sign(params, JWT_ACCESS_SECRET_KEY, { expiresIn: JWT_ACCESS_EXPIRATION_TIME });
        return token;
    }

    generateRefreshToken (params) {
        if (!utils.isObject(params)) {
            throw new Error("Invalid parameter");
        }
        const token = jwt.sign(params, JWT_REFRESH_SECRET_KEY, { expiresIn: JWT_REFRESH_EXPIRATION_TIME });
        return token;
    }

    checkRefreshToken(token) {
        return jwt.verify(token, JWT_REFRESH_SECRET_KEY, (err, data) => {
            if (err) {
                return false;
            } else {
                return data;
            }
        });
    }
}

module.exports = Oauth;
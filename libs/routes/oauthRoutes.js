/** dependencies */
const router = require('express').Router();
const Oauth = require('../authorizations');
const { UserManager } = require('../dataSources');

router.post("/token/refresh", async (req, res, next) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return next({message: `Missing token`});
    }

    let oauth = new Oauth();
    userIdentifier = oauth.checkRefreshToken(refresh_token);
    if (!userIdentifier) {
        return res.status(403).end('Forbidden.');
    }
    try {
        let userManager = new UserManager();
        const user = await userManager.getUserByEmail(userIdentifier.email);
        if ( user == null ) {
            throw new Error(`User ${email} does not exist.`);
        }
        let oauth = new Oauth();
        const accessToken = oauth.generateAccessToken({ email: user.email, username: user.name});
        const refreshToken = oauth.generateRefreshToken({ email: user.email });
        res.send({success: true, data: {token: accessToken, refresh_token: refreshToken, username: user.name, email: user.email }});
    } catch (err) {
        res.status(401).end('Unauthorized.');
    }
});

module.exports = router
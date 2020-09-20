/** dependencies */
const router = require('express').Router();
const bcrypt = require('bcrypt');

const { DatabaseManager, UserManager, Validator } = require('../dataSources');
const Oauth = require('../authorizations');

/**
 * @parameter {email, password, username}
 * @method POST
 */
router.post("/register", async (req, res, next) => {
    const { email, password, repeat_password, username } = req.body;
    try {
        let validator = new Validator();
        validator.registerValidator({ email, password, repeat_password, username });
        let userManager = new UserManager();
        if (await userManager.getUserByEmail(email)) {
            return next({message: `User ${email} already sign up`});
        }
        let encryptedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
        userManager.create({ email, password: encryptedPassword, username });
        let oauth = new Oauth();
        const accessToken = oauth.generateAccessToken({ email: email, username: username});
        const refreshToken = oauth.generateRefreshToken({ email: email });
        // res.cookie('refresh_token', refreshToken, { maxAge: Number(process.env.JWT_REFRESH_EXPIRATION_TIME) * 1000});
        res.send({ success: true, message: `User ${email} sign up successfully.`, data: { username: username, token: accessToken, refresh_token: refreshToken} });
    } catch (err) {
        next(err);
    }
});

router.post("/login", async (req, res, next) => {
    const {email, password} = req.body;
    try {
        let validator = new Validator();
        validator.emailValidator(email);
        let userManager = new UserManager();
        const user = await userManager.getUserByEmail(email);
        if ( user == null ) {
            throw new Error(`User ${email} does not exist.`);
        }
        if ( await bcrypt.compare(password, user.password) ) {
            let oauth = new Oauth();
            const accessToken = oauth.generateAccessToken({ email: user.email, username: user.name});
            const refreshToken = oauth.generateRefreshToken({ email: user.email });
            res.send({success: true, data: {token: accessToken, refresh_token: refreshToken, username: user.name }});
        } else {
            res.status(401).end('Incorrect password.');
        }
    } catch(err) {
        next(err);
    }
});

module.exports = router
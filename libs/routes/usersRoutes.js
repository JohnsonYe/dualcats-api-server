/** dependencies */
const router = require('express').Router();
const bcrypt = require('bcrypt');

const { DatabaseManager, UserManager, Validator } = require('../dataSources');
const Authorization = require('../authorizations');

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
        res.send({success: true, message: `User ${email} sign up successfully.`});
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
            let authorization = new Authorization();
            const token = authorization.generateToken({ email: user.email, name: user.name});
            res.send({success: true, token: token});
        } else {
            res.status(401).end('Incorrect password.');
        }
    } catch(err) {
        next(err);
    }
});

router.post("/logout", (req, res, next) => {
    /** to do invalud jwt */
});

module.exports = router
/** dependencies */
const router = require('express').Router();
const imageRoutes = require('./routes/imageRoutes');
const userRoutes = require('./routes/usersRoutes');
const oauthRouters = require('./routes/oauthRoutes');


router.use("/images", imageRoutes);

router.use("/users", userRoutes);

router.use('/oauth', oauthRouters);

module.exports = router;
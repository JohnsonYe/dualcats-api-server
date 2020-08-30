const express = require('express')
const http    = require("http");
const https   = require("https");
const cors    = require("cors");
const morgan  = require("morgan");
require('dotenv').config();
const routes = require('./libs/routes.js');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const { constants } = require('crypto');

const app = express();
const fs = require('fs');

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false } ));
app.use(fileUpload());

// public floder
// app.use(express.static('./build'));

// app.use("/build", (req, res, next) => {
//     req.url = path.basename(req.originalUrl);
//     express.static(__dirname + '/static')(req, res, next);
// });
// app.use("/build", express.static(path.join(__dirname, "build")))

app.use("/api/v1", routes);


app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        error: {
            status: error.status || 500,
            message: error.message || "Internal Server Error",
        }
    });
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
    res.status(404).send('Welcome to my 404 🏠');
});

const PORT = process.env.PORT || 8084;
if (process.env.SSL_ENABLE != "true") {
    http.createServer(app).listen(process.env.PORT || 8084, () => {
        console.log('Server is running on %s mode, listening at port %s', process.env.NODE_ENV , PORT || 8084);
    });
} else {
    const serverOptions = {
        httpsServerOptions: {
            secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
            key: fs.readFileSync('../ssl/server.key'),
            cert: fs.readFileSync('../ssl/server.crt'),
            ciphers : ["ECDHE-RSA-AES256-GCM-SHA384","ECDHE-RSA-AES128-GCM-SHA256","ECDH-RSA-AES128-SHA256","DHE-RSA-AES128-SHA256","HIGH","!AES128-GCM-SHA256","!AES128-SHA","!ECDHE-RSA-AES256-SHA384","!ECDHE-RSA-AES256-SHA","!AES256-GCM-SHA384", "!AES256-SHA256", "!AES256-SHA", "!ECDHE-RSA-AES128-SHA", "!TLS_RSA_WITH_AES_128_GCM_SHA256", "!AES128-SHA256", "!TLS_RSA_WITH_AES_128_CBC_SHA", "!aNULL", "!eNULL", "!EXPORT", "!DES", "!RC4", "!MD5", "!PSK", "!SRP", "!CAMELLIA"].join(':'),
            honorCipherOrder: true
        }
    };
    const https_server = https.createServer(serverOptions, app);
    https_server.listen(PORT, () => {
        console.log('Server is running on %s mode, listening at port %s', process.env.NODE_ENV , PORT);
    });
}

module.exports.app = app;

/** dependencies */
const {Pool}  = require('pg');
const joi = require('joi');


/**
 * Postgresql connection
 */
const pool = new Pool({
    "user": process.env.AWS_RDS_USER || "",
    "host": process.env.AWS_RDS_HOST || "127.0.0.1",
    "database": process.env.AWS_RDS_DATABASE || "localhost",
    "password": process.env.AWS_RDS_PASSWORD || "",
    "port": process.env.AWS_RDS_PORT || "5432",
    "max": Number(process.env.AWS_RDS_MAX_CONNECTION) || 20,
    "connectionTimeoutMillis" : 0,
    "idleTimeoutMillis": 0
});

class DatabaseManager {
    constructor (database) {
        switch (database) {
            case 'sql':
                this.db = new SqlDatabase(pool);;
            case 'mongo':
                // todo
                break;
            default:
                throw new Error("need to defind a database type (sql or mongo)");
        }
    }

    database() {
        return this.db;
    }



    openConnection() {
        // todo
    }

    closeConnection() {
        // todo
    }
}

class SqlDatabase {
    constructor (database) {
        this.db = database;
    }

    async query(queryString, options) {
        try {
            let data;
            if (options) {
                data = await this.db.query(queryString, options);
            } else {
                data = await this.db.query(queryString);
            }
            return data.rows;
        } catch (err) {
            throw err;
        }
    }
}

class UserManager {
    constructor() {

    }

    getUserById() {

    }

    async getUserByEmail(email) {
        let db = new DatabaseManager('sql').database();
        let queryString = `select id, email, password, name from users where email=$1`,
            options = [email];
        try {
            const user = await db.query(queryString, options)
            if (user.length) {
                return user[0];
            } 
            return null;
        } catch (err) {
            throw err;
        }
    }

    async create({ email, password, username}) {
        let db = new DatabaseManager('sql').database();
        let queryString = `insert into users("email", "password", "name") values ($1, $2, $3) returning "id"`,
            options = [ email, password, username ];
        try {
            const [data] = await db.query(queryString, options)
            return data.id;
        } catch (err) {
            throw err;
        }
    }

    delete(user) {
        // todo
    }

    update(user) {

    }
}

class Validator {
    registerValidator(user) {
        const { email, password, repeat_password ,username } = user;
        const schema = joi.object(VALIDATE_SCHEMA.REGISTER_USER_SCHEMA).with('username', 'email').with('password', 'repeat_password');
        const value = schema.validate({ email, password, repeat_password ,username });
        if ('error' in value) {
            throw value.error.details[0].message;
        }
    }

    emailValidator(email) {
        const schema = joi.object(VALIDATE_SCHEMA.EMAIL_SCHEMA).with('username', 'email').with('password', 'repeat_password');
        const value = schema.validate({ email });
        if ('error' in value) {
            throw value.error.details[0].message;
        }
    }
}

const VALIDATE_SCHEMA = {
    REGISTER_USER_SCHEMA: {
        username: joi.string().alphanum().min(3).max(30).required(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { 
            allow: ['com', 'net', 'org', 'cn', 'co', 'io', 'edu']
        }}).required(),
        password: joi.string().pattern(new RegExp('^[a-zA-Z0-9,.!@#$%&*]{3,30}$')),
        repeat_password: joi.ref('password')
    },

    EMAIL_SCHEMA: {
        email: joi.string().email({ minDomainSegments: 2, tlds: { 
            allow: ['com', 'net', 'org', 'cn', 'co', 'io', 'edu']
        }})
    }
};

module.exports = {
    DatabaseManager: DatabaseManager,
    UserManager: UserManager,
    Validator: Validator
};
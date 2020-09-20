// Authentication & Sessions
const auth = require("basic-auth");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

// Session settings
const sess = {
  secret: "big chungus",
  resave: false,
  saveUninitialized: true,
  cookie: {},
  store: new MongoStore({
    url: process.env.MONGO_URL,
    ttl: 120,
  }),
};

module.exports = {
    auth, session, sess, MongoStore
}
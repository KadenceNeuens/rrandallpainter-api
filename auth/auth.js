// Authentication & Sessions
const auth = require("basic-auth");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");

// Session settings
const sess = {
  secret: "big chungus",
  resave: false,
  saveUninitialized: true,
  cookie: { sameSite: 'none', secure: true },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 3600
  })
}

module.exports = {
    auth, session, sess, MongoStore
}
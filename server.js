const express = require("express");
const app = express();
const port = 3080;
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // for parsing application/json

const cors = require("cors");
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

require("dotenv").config();
const { Console } = require("console");
const fetch = require("node-fetch");

// My Cloudinary Middleware
const cloud = require("./cloudinary_responses/cloud");

// Authentication & Sessions
const auth = require("basic-auth");
const compare = require("tsscmp");
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
//Serve secure cookies in production
if (app.get("env") === "production") {
  sess.cookie.secure = true;
}
// Set session
app.use(session(sess));

//-------------------------------------
// On all req
app.use("/", (req, res, next) => {
  if (req.session.type === "admin") {
    res.end("Welcome back, Big Chungus!");
  }
  next();
});

//-------------------------------------
// POST - Login
app.use("/login", (req, res, next) => {
  if (req.session.type === "admin") {
    res.end("Welcome back, Big Chungus!");
  } else {
    const credentials = auth(req);
    if (!credentials || !check(credentials.name, credentials.pass)) {
      res.statusCode = 401;
      res.setHeader("WWW-Authenticate", 'Basic realm="admin"');
      console.log("Access denied!");
      res.json({ auth: false });
    } else {
      req.session.type = "admin";
      console.log(req.session.type);
      console.log("Access granted!");
      res.json({ auth: true });
    }
  }
  next();
});

// Basic function to validate credentials for example
function check(name, pass) {
  var valid = true;

  // Simple method to prevent short-circut and use timing-safe compare
  valid = compare(name, process.env.ADMIN_USERNAME) && valid;
  valid = compare(pass, process.env.ADMIN_PASSWORD) && valid;
  return valid;
}

//-------------------------------------
//  GET
app.use("/", cloud);

//-------------------------------------
// POST
app.post("/images", (req, res) => {
  res.send("");
});

app.put("/images", (req, res) => {
  res.send("");
});

app.delete("/images", (req, res) => {
  res.send("");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

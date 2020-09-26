const serverless = require('serverless-http');
const express = require("express");
const router = express.Router();
const app = express();
// const port = 3080;
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // for parsing application/json

const cors = require("cors");
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

require("dotenv").config();

const { auth, session, sess, MongoStore } = require("./auth/auth");
const { check, requireAdmin } = require("./auth/helpers");

//Serve secure cookies in production
if (app.get("env") === "production") {
  sess.cookie.secure = true;
}
// Set session
app.use(session(sess));

//-------------------------------------
// POST - Login
app.use("/login", (req, res, next) => {
  if (req.session.type === "admin") {
    console.log(sess)
    res.send("Welcome back, Big Chungus!")
  } else {
    const credentials = auth(req);
    if (!credentials || !check(credentials.name, credentials.pass)) {
      res.statusCode = 401;
      res.setHeader("WWW-Authenticate", 'Basic realm="admin"');
      console.log("Access denied!");
      res.json({ auth: false });
    } else {
      req.session.type = "admin";
      console.log(req.session);
      console.log("Access granted!");
      res.json({ auth: true });
    }
  }
  next();
});

// Routes
router.use("/images", require("./routes/images"));
router.use("/api", requireAdmin, require("./routes/api"));

app.use("/", router);


module.exports.handler = serverless(app);

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });
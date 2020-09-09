const express = require('express')
const app = express()
const port = 3080
const cors = require('cors')

app.use(cors())

require('dotenv').config()
const { Console } = require('console')
const cloudinary = require('cloudinary')

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
  });

const auth = require('basic-auth')
const compare = require('tsscmp')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

// Session settings
const sess = {
  secret: 'big chungus',
  resave: false,
  saveUninitialized: true,
  cookie: {},
  store: new MongoStore({
    url: process.env.MONGO_URL,
    ttl: 120
  })
}
//Serve secure cookies in production
if (app.get('env') === 'production')
{
  sess.cookie.secure = true
}
// Set session
app.use(session(sess))


//-------------------------------------
// On all req


//-------------------------------------
// POST - Login
app.post('/login', (req, res, next) => {
  console.log(req.session.type)
  if (req.session.type === 'admin')
  {
    res.end('Welcome back, Big Chungus!')
  }
  else
  {
    const credentials = auth(req)
    if (!credentials || !check(credentials.name, credentials.pass)) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="admin"')
      console.log('Access denied!')
      res.json({auth: false})
    } else {
      req.session.type="admin"
      console.log(req.session.type)
      console.log('Access granted!')
      res.json({auth: true})
    }
  }
  console.log("Success!")
  next()
})

// Basic function to validate credentials for example
function check (name, pass) {
  var valid = true
 
  // Simple method to prevent short-circut and use timing-safe compare
  valid = compare(name, process.env.ADMIN_USERNAME) && valid
  valid = compare(pass, process.env.ADMIN_PASSWORD) && valid
 
  return valid
}

//-------------------------------------
// GET

// All Images
app.get('/images', (req, res) => {
  if (req.session.type === 'admin')
  {
    console.log("Pulling all images")

  }  
  else
  {
    console.log("Access denied")
  }
})

// Residential Images
app.get('/images/residential', (req, res) => {
  if (req.session.type === 'admin')
  {
    console.log("Pulling all residential images")
    
  }  
  else
  {
    console.log("Access denied")
  }
})

// Commercial Images
app.get('/images/commercial', (req, res) => {
  if (req.session.type === 'admin')
  {
    console.log("Pulling all commercial images")
    
  }  
  else
  {
    console.log("Access denied")
  }
})

// //-------------------------------------
// // POST
app.post('/images', (req, res) => {
  res.send("")
})

app.put('/images', (req, res) => {
  res.send("")
})

app.delete('/images', (req, res) => {
  res.send("")
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
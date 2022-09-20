const express = require("express")
const session = require("express-session")
require("dotenv").config()
const redis = require("redis")
cors = require("cors")
const { hashSync, genSaltSync, compareSync } = require("bcrypt")

const app = express()
app.use(cors())

const redisStore = require("connect-redis")(session)

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
})

client.on("connect", () => {
  console.log("Redis client connected")
})

client.on("error", (err) => {
  console.log("Something went wrong " + err)
})

const sessionStore = new redisStore({ client: client })

app.use(express.json())

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
)

app.get("/", (req, res) => {
  res.send("Entry page")
})

app.get("/home", (req, res) => {
  if (req.session.user) {
    res.send("Welcome to the home page")
  } else {
    res.send("Please login")
  }
})

// register route
app.post("/register", (req, res) => {
  try {
    let { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: "Please enter all fields" })
    }
    // check if user already exists
    client.get(username, (err, data) => {
      if (err) throw err
      if (data !== null) {
        return res.status(400).json({ message: "User already exists" })
      }
    })
    // hash password
    const salt = genSaltSync(10)
    password = hashSync(password, salt)

    client.hset("users", username, password, (err, reply) => {
      if (err) {
        console.log(err)
        res.status(401).json({ message: "Error occured" })
      }
      console.log(reply)
      res.status(200).json({ message: "User created successfully" })
      re.redirect("/home")
    })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Error occured" })
  }
})

// login route
app.post("/login", (req, res) => {
  try {
    let { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: "Please enter all fields" })
    }
    client.hget("users", username, (err, reply) => {
      if (err) {
        console.log(err)
        res.status(401).json({ message: "Error occured" })
      }
      if (reply === null) {
        res.status(401).json({ message: "User does not exist" })
      } else {
        const result = compareSync(password, reply)
        if (result) {
          req.session.user = username
          res.status(200).json({ message: "Login successful" })
        } else {
          res.status(401).json({ message: "Password is incorrect" })
        }
      }
    })
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Error occured" })
  }
})

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`)
})

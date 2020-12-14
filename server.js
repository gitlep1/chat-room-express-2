// require necessary NPM packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// require route files
const exampleRoutes = require('./app/routes/example_routes')
const chatRoutes = require('./app/routes/chat_routes')
const userRoutes = require('./app/routes/user_routes')
const channelRoutes = require('./app/routes/channel_routes')

// require middleware
const errorHandler = require('./lib/error_handler')
const replaceToken = require('./lib/replace_token')
const requestLogger = require('./lib/request_logger')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// require configured passport authentication middleware
const auth = require('./lib/auth')

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 4741
const clientDevPort = 7165

// establish database connection
// use new version of URL parser
// use createIndex instead of deprecated ensureIndex
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})

// instantiate express application object
const app = express()

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
app.use(cors({ origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}` }))

// define port for API to run on
const port = process.env.PORT || serverDevPort

// this middleware makes it so the client can use the Rails convention
// of `Authorization: Token token=<token>` OR the Express convention of
// `Authorization: Bearer <token>`
app.use(replaceToken)

// register passport authentication middleware
app.use(auth)

// add `express.json` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(express.json())
// this parses requests sent by `$.ajax`, which use a different content type
app.use(express.urlencoded({ extended: true }))

// log each request as it comes in for debugging
app.use(requestLogger)

// register route files
app.use(exampleRoutes)
app.use(chatRoutes)
app.use(userRoutes)
app.use(channelRoutes)

// register error handling middleware
// note that this comes after the route middlewares, because it needs to be
// passed any error messages from them
app.use(errorHandler)

// require socket.io middleware and pass it the server object

const server = require('http').createServer(app)

// run API on designated port (4741 in this case) / create server instance
server.listen(port, () => {
  // console.log('listening on port ' + port)
})

const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
})

// establish socket and create actions
// console log when a client connects or disconnects from the server
io.on('connection', (socket) => {
  // console.log('user connected')
  // setup event listeners on socket
  socket.on('disconnect', () => {
    // console.log('user disconnected')
  })
})

// needed for testing
module.exports = app

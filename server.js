const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

// fake DB
const rooms = []


// socket.io server
io.on('connection', socket => {
  socket.on('makeRoom', (data) => {
    rooms.push(data)
    socket.broadcast.emit('makeRoom', data)
  })
})

nextApp.prepare().then(() => {
  app.get('/rooms', (req, res) => {
    const queryParams = { id: req.query.id}
    if (req.query.id){
      nextApp.render(req, res, '/rooms' , queryParams)
    } else {
      res.json(rooms)
    }
  })

  app.get('/rooms:id', (req, res) => {
    const queryParams = { id: req.query.id}
    nextApp.render(req, res, '/rooms' ,  queryParams)
  })

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})

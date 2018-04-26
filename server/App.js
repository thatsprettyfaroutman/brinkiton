import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import { Server as httpServer } from 'http'



const PORT = process.env.PORT || 3000
const app = express()
const server = httpServer(app)

app.use(cors())
app.use(bodyParser.json())

app.use(express.static('./public'))
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../client')))
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/index.html'))
  })
}


app.get('/api/something', async (req, res) => {
  try {
    res.status(200).json({})
  } catch (err) {
    res.status(400, err.message)
  }
})




if (process.env.NODE_ENV === 'production') {
  app.get('/**', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/index.html'))
  })
}



server.listen(PORT, () => {
  console.log(`Server listening port ${PORT}!`)
})

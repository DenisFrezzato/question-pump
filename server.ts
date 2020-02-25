import * as Busboy from 'busboy'
import * as express from 'express'
import * as pump from 'pump'
import concat = require('concat-stream')

const app = express()

app.post('/', (req, res) => {
  const busboy = new Busboy({ headers: req.headers })

  busboy.on('file', (_, file) => {
    pump(
      file,
      concat(buffer =>
        someAsyncStuff(buffer.toString())
          .then(length => res.send({ length }))
          .catch(err => res.status(500).send(err.message))
      ),
      err => {
        if (err) res.status(500).send(err.message)
      }
    )
  })

  // With pump, connection is closed after stream is consumed.
  pump(req, busboy, err => {
    if (err) res.status(500).send(err.message)
  })
  // With pipe it works fine.
  // req.pipe(busboy)
})

function someAsyncStuff(s: string): Promise<number> {
  return new Promise(resolve => setTimeout(() => resolve(s.length), 1))
}

app.listen('3000', (err) => {
  if (err) return console.error(err)
  console.log('Server is listening')
})

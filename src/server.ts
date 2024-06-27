import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/hello', async () => {
  const tables = knex('sqlite_schema').select('*')
  return tables
})

app.listen({ port: 3333 }, (err) => {
  if (err) throw err
  console.log(`Server is listening on http://localhost:3333`)
})

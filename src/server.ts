import { app } from './app'
import { env } from './env'

app.listen({ port: env.PORT }, (err) => {
  if (err) throw err
  console.log(`Server is listening on http://localhost:${env.PORT}`)
})

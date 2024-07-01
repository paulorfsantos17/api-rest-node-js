import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'child_process'

describe('Transactions Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('pnpm knex migrate:rollback --all')
    execSync('pnpm knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    const response = await request(app.server)
      .post('/transactions')
      .send({ title: 'New transactions', amount: 5000, type: 'credit' })

    expect(response.statusCode).toEqual(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionsResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'New transactions', amount: 5000, type: 'credit' })

    const cookies = createTransactionsResponse.get('Set-cookie') as string

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({ title: 'New transactions', amount: 5000 }),
    ])
    expect(listTransactionsResponse.statusCode).toEqual(200)
  })

  it('should be able to get a specific transactions', async () => {
    const createTransactionsResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'New transactions', amount: 5000, type: 'credit' })

    const cookies = createTransactionsResponse.get('Set-cookie') as string

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        id: transactionId,
        title: 'New transactions',
        amount: 5000,
      }),
    )
    expect(getTransactionResponse.statusCode).toEqual(200)
  })
  it('should be able to get the summary', async () => {
    const createTransactionsResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'New transactions', amount: 5000, type: 'credit' })

    const cookies = createTransactionsResponse.get('Set-cookie') as string

    await request(app.server)
      .post('/transactions')
      .send({ title: 'Debit transactions', amount: 500, type: 'debit' })
      .set('Cookie', cookies)

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(summaryResponse.body.summary).toEqual({
      amount: 4500,
    })
    expect(summaryResponse.statusCode).toEqual(200)
  })
})

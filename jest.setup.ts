import 'reflect-metadata'
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

// jest.setup.js
jest.setTimeout(30000) // Aumente o timeout para testes mais longos, se necessário

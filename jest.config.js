const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'node', // Como probamos API/Lógica, 'node' es más rápido que 'jsdom'
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Para que entienda los imports con @
  },
}

module.exports = createJestConfig(customJestConfig)
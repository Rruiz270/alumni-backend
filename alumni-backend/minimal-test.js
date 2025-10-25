const express = require('express')
const app = express()
const PORT = parseInt(process.env.PORT || '8000')

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.get('/', (req, res) => {
  res.json({ message: 'Alumni Backend API is running!' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
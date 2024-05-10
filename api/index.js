import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

// api
import { handleRunScraper } from './scraperLibraire/index.js'

const app = express()
const port = process.env.PORT || 3001

// Pour gérer correctement les chemins relatifs avec ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cors
app.use(cors())

// Analyser automatiquement les corps des requêtes en JSON
app.use(express.json())

// ----------------------------

// Routes
app.post('/api/scraper', async (req, res) => {
  const { url } = req.body

  const scraperResult = await handleRunScraper(url)

  console.log('server: scraperResult', scraperResult)
  console.log('server: Total number of booked scraped', scraperResult.length)

  res.send(JSON.stringify(scraperResult))
})

// ----------------------------

// Serve static files from React app
app.use(express.static(path.join(__dirname, '..', 'dist')))

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
})

export default function startServer() {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

import './App.css'
import { useState } from 'react'

const booksUrl = 'https://www.leslibraires.fr/rayon/litterature/?f_release_date=all'

function App() {
  const [apiData, setApiData] = useState()

  const runScraper = async () => {
    const currentEnv = 'http://localhost:3001'

    try {
      const response = await fetch(`${currentEnv}/api/scraper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: booksUrl }) // Envoyer la valeur du champ texte
      })

      const data = await response.json()
      console.log('Data scraped:', data)
      setApiData(data)
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API", error)
    }
  }

  return (
    <>
      <h1>Scraper</h1>
      <div className='card'>
        <button onClick={runScraper}>Test api</button>
      </div>

      {apiData && (
        <>
          <div className='data-wrapper'>
            <pre>{JSON.stringify(apiData, null, 2)}</pre>
          </div>
        </>
      )}
    </>
  )
}

export default App

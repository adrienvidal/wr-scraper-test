import puppeteer from 'puppeteer-core'
import * as ChromeLauncher from 'chrome-launcher'
import { scrapeData, wait } from './logic.js'

let booksArr = []

const runScraper = async url => {
  console.log('server: A')

  // reset
  booksArr = []

  console.log('server: B')
  // launch puppeteer
  const chrome = await ChromeLauncher.launch({
    startingUrl: 'https://google.com'
  })

  const response = await fetch(`http://127.0.0.1:${chrome.port}/json/version`)
  const data = await response.json()
  const wsEndpoint = data.webSocketDebuggerUrl

  console.log(`server: Chrome debugging port running on ${chrome.port}`)
  console.log(`server: Chrome wsEndpoint`, wsEndpoint)
  console.log(`server: Chrome`, chrome)

  console.log('server: C')

  const browser = await puppeteer.connect({
    browserWSEndpoint: wsEndpoint
  })

  console.log('server: D')

  // const browser = await puppeteer.launch({
  //   headless: false
  // })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1300,
    height: 600
  })

  // go to url
  // const url = 'https://www.leslibraires.fr/rayon/litterature/?f_release_date=all'
  await page.goto(url, {
    waitUntil: 'domcontentloaded'
  })

  await wait(3000)

  // scrap
  const booksList = await scrapeData(page)
  booksArr = booksArr.concat(booksList)

  // // scrap
  // while (true) {
  //   await wait(2000)
  //   const booksList = await scrapeData(page)
  //   booksArr = booksArr.concat(booksList)

  //   if (!(await nextPageBoolean(page))) {
  //     break
  //   }

  //   await wait(3000)
  //   await autoScroll(page)

  //   await wait(3000)
  //   await clickNext(page)
  // }

  // console.log('booksArr', booksArr)
  // console.log('Total number of booked scraped:', booksArr.length)

  console.log('server: Done !')

  await browser.close()

  return booksArr
}

export async function handleRunScraper(url) {
  console.log('server: runScraper', url)
  try {
    const result = await runScraper(url)
    return result
  } catch (error) {
    console.error('Erreur lors du scraping: ', error)
    return { error: `Erreur lors du scraping des données: ${error.message}` }
  }
}

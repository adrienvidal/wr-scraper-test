import puppeteer from 'puppeteer'
import {
  autoScroll,
  clickCategory,
  clickNext,
  nextPageBoolean,
  scrapeData,
  wait
} from './logic.js'

let booksArr = []

const runScraper = async () => {
  // reset
  booksArr = []

  // launch puppeteer
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1300,
    height: 600
  })

  // go to url
  const endpoint = 'https://books.toscrape.com/'
  await page.goto(endpoint, {
    waitUntil: 'domcontentloaded'
  })

  // go to category
  await wait(3000)
  await clickCategory(page)

  // scrap
  while (true) {
    await wait(2000)
    const booksList = await scrapeData(page)
    booksArr = booksArr.concat(booksList)

    if (!(await nextPageBoolean(page))) {
      break
    }

    await wait(3000)
    await autoScroll(page)

    await wait(3000)
    await clickNext(page)
  }

  console.log('booksArr', booksArr)
  console.log('Total number of booked scraped:', booksArr.length)

  console.log('Done !')

  await browser.close()

  return booksArr
}

export async function handleRunScraper() {
  console.log('server: runScraper')
  try {
    const result = await runScraper()
    return result
  } catch (error) {
    return { error: 'Erreur lors du scraping des données.' }
  }
}

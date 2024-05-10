import * as cheerio from 'cheerio'

let counter = 0

export const scrapeData = async page => {
  let booksArr = []
  const $ = cheerio.load(await page.content())
  const productsListTag = 'ul.ppanel-product li'

  // check exist
  if (!(await page.$(productsListTag))) {
    counter++
    console.log(`can't find the scrapeData selector ... running retry number ${counter}`)
    if (counter < 3) {
      await wait(2000)
      return await scrapeData(page)
    } else {
      console.log('Unable to find scrapeData selector... Moving on.')
      counter = 0
      return []
    }
  }
  counter = 0

  // scrap
  const liTags = $(productsListTag)

  for (let i = 0; i < liTags.length; i++) {
    const el = liTags[i]
    const detailLink = $(el).find('.details a').attr('href')
    if (detailLink) {
      const url = `https://www.leslibraires.fr${detailLink}`
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
        const newPageContent = await page.content()
        const $newPage = cheerio.load(newPageContent)

        // get datas
        const title = $newPage('h1').text().trim()
        const type = getCategory(url)
        const ean = $newPage('[data-ean13]').attr('data-ean13')

        booksArr.push({ title, type, ean })
      } catch (error) {
        console.log(`Error navigating to ${url}: ${error}`)
        continue // Skip this link and move to the next one
      }
    }
  }

  return booksArr
}

export const wait = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const getCategory = url => {
  // Utiliser une regex pour trouver le texte désiré
  const regex = /^https:\/\/www\.leslibraires\.fr\/([^\/]+)\//
  const match = url.match(regex)

  if (match) {
    return match[1]
  } else {
    console.log('server: getCategory', 'not find')
  }
}

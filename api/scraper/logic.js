import * as cheerio from 'cheerio'

let counter = 0

export const wait = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const clickCategory = async page => {
  const catAttr = 'catalogue/category/books/mystery_3/index.html'

  if (!(await page.$(`a[href='${catAttr}']`))) {
    counter++

    if (counter < 3) {
      console.log(`can\'t find category selector... Running retry number ${counter}`)
      await wait(2000)
      await clickCategory(page)
    } else {
      console.log(`unable to find category selector... Moving on.`)
      counter = 0
    }

    return
  }

  counter = 0

  await page.click(`a[href='${catAttr}']`)
}

export const scrapeData = async page => {
  let booksArr = []
  const $ = cheerio.load(await page.content())

  if (!(await page.$('ol.row li'))) {
    counter++
    console.log(`can't find the scrapeData selector ... running retry number ${counter}`)

    if (counter < 3) {
      await wait(2000)
      await scrapeData(page)
    } else {
      console.log('Unable to find scrapeData selector... Moving on.')
      counter = 0
    }

    return
  }

  counter = 0

  // get li tags
  const liTags = $('ol.row li')

  // extract data for each book
  const baseUrl = 'https://books.toscrape.com/'
  liTags.each((i, el) => {
    let imageUrl = $(el).find('img').attr('src')
    imageUrl = imageUrl.replaceAll('../', '').trim()
    imageUrl = baseUrl + imageUrl

    let starRating = $(el).find('p.star-rating').attr('class')
    starRating = starRating.replace('star-rating', '').trim()

    const title = $(el).find('h3').text().trim()
    const price = $(el).find('p.price_color').text().trim()
    const availability = $(el).find('p.instock.availability').text().trim()
    const book = { imageUrl, starRating, title, price, availability }

    booksArr.push(book)

  })

  return booksArr
}

export const autoScroll = async page => {
  await wait(2000)

  const selector = 'li.next'
  if (!(await page.$(selector))) {
    await wait(2000)

    if (counter < 3) {
      counter++
      console.log(
        `can't find the next element selector ... running retry number ${counter}`
      )
      await autoScroll(page)
    } else {
      console.log('Unable to find next element selector... Moving on.')
      counter = 0
    }

    return
  }

  await page.evaluate(selector => {
    const element = document.querySelector(selector)
    element.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, selector)
}

export const clickNext = async page => {
  await page.click('li.next a')
}

export const nextPageBoolean = async page => {
  //load cheerio
  const $ = cheerio.load(page.content())

  if (!(await page.$('li.next'))) {
    await wait(2000)

    if (counter < 3) {
      counter++
      console.log(
        `can't find the next element selector ... running retry number ${counter}`
      )
      await nextPageBoolean(page)
    } else {
      console.log('Unable to find next element selector... Moving on.')
      counter = 0
    }

    return
  }

  return true
}
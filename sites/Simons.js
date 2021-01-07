const start = require('../helpers/start')
const { randomIntFromInterval } = require("../helpers/helpers")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll('.product_card')
        const salesPage = window.location.href.includes("sale")

        const formated = Array.from(products).map(product => {
            let price, sale_price

            const image = product.querySelector("img")
            if (!image) { return null }
            const title = product.querySelector(".desc")
            if (salesPage) {
                console.log("1111")
                price = product.querySelector(".listPrice")
                sale_price = product.querySelector(".salePrice")
            } else {
                price = product.querySelector(".salePrice")
            }
            const link = product.querySelector("a")




            return {
                image: image.src,
                title: title.innerText,
                price: price.innerText,
                sale_price: sale_price ? sale_price.innerText : null,
                product_link: link.href,
                hqImage: image.src
            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)

    console.log(`goto ${url}`)
    await page.goto(url);

    console.log(`wait for .product_card`)
    await page.waitFor('.product_card')

    console.log(`click .show_all`)
    await page.evaluate(() => {
        const a = document.querySelector(".show_all")
        a.click()
    })

    await page.waitFor(10000)

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 80000

    console.log('loop')
    while (((Date.now() - startTime) < scheduled_duration) && data.length < 61) {
        let newArticles = await getArticles(page)
        if (!Array.isArray(newArticles)) {
            newArticles = newArticles._v
        }
        newArticles.forEach(article => {
            const alreadyAdded = data.find(x => x.title === article.title)
            if (!alreadyAdded) {
                data.push(article)
            }
        })

        for (let i = 0; i < randomIntFromInterval(5, 15); i++) {
            await page.evaluate(e => window.scrollBy(0, 100));
        }
        console.log(data.length)
        await page.waitFor(randomIntFromInterval(500, 2000))
    }


    await browser.close();
    return data
}
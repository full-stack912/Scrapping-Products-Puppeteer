const start = require('../helpers/start')
const { randomIntFromInterval, scrollDown } = require("../helpers/helpers")
const proxyHelper = require("./helpers/proxy_helper")

const getArticles = async (page) => {
    console.log("scrolling down")
    await scrollDown(page)

    return await page.evaluate(() => {
        const products = document.querySelectorAll(".product-grid__tile-icI")

        const salesPage = window.location.pathname.includes("sale")

        const formated = Array.from(products).map(product => {
            let price, sale_price

            const image = product.querySelector("img")
            if (image == null) {return null}

            const title = product.querySelector(".link-SmN")

            const link = product.querySelector(".link-SmN")
            
            if (salesPage) {
                price = product.querySelector(".price-item-14x")
                sale_price = product.querySelector(".price--sale")
            } else {
                price = product.querySelector(".price-item-14x")
            }

            if (!price) {
                console.log("missign price", price, product)
            } else if (!title) {
                console.log("missign title")
            } else if (!link) {
                console.log("missign link")
            }

            // https://s7.toryburch.com/is/image/ToryBurch/cleo-bag-main.TB_73309_104.grid-468x531.jpg
            // -->
            // https://s7.toryburch.com/is/image/ToryBurch/cleo-bag-main.TB_73309_104.pdp-622x707.jpg

            const b = image.src.split("grid-")
            const hqImage = `${b[0]}pdp-622x707.jpg`
            return {
                image: image.src,
                title: title.title,
                price: price.innerText,
                sale_price: sale_price ? sale_price.innerText : null,
                hqImage,
                product_link: link.href,

            }
        })

        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(await proxyHelper.go())
    
    console.error(`goto ${url}`)
    await page.goto(url);

    console.error(`waitFor .product-grid__tile-icI`)
    await page.waitFor('.product-grid__tile-icI')

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length < 60) {
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
        
        await page.waitFor(randomIntFromInterval(0, 1000))
    }


    await browser.close();
    return data
}

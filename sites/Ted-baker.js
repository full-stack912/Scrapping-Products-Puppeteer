const start = require('../helpers/start')
const { randomIntFromInterval } = require("../helpers/helpers")
const proxyHelper = require("./helpers/proxy_helper")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll('.product-wrap')

        console.log("collecting")
        const formated = Array.from(products).map(product => {
            const image = product.querySelector("img")
            // if(image.src.includes("data:image")) {return null}
            const title = product.querySelector(".summary")
            if (!title) { return null }


            const link = product.querySelector("a")
            const price = product.querySelector("li.price")

            if (!price || !image) { return null }
            const b = image.src.split("&w=")
            const hqImage = `${b[0]}&w=1208%26h=1506%26q=100`



            return {
                image: image.src,
                title: title.innerText,
                price: price ? price.innerText : null,
                // sale_price: sale_price ? sale_price.innerText : null,
                hqImage,
                product_link: link.href,

            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(await proxyHelper.go())

    console.log(`goto ${url}`)
    await page.goto(url);

    console.log('waiting for .product-wrap')
    await page.waitFor('.product-wrap')

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length <= 59) {
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

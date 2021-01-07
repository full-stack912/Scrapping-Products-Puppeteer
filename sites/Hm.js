const start = require('../helpers/start')
const {randomIntFromInterval} = require("../helpers/helpers")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll('.product-item')
        const salesPage =  window.location.pathname.includes("sale")

        const formated = Array.from(products).map(product => {
            let price, sale_price

            const image = product.querySelector("img")
            if(!image.src) {return null}
            const title = product.querySelector("h3")
            if(!title){return null}
            if(salesPage) {
                price = product.querySelector(".price.regular")
                sale_price = product.querySelector(".price.sale")
            } else {
                price = product.querySelector(".price")
            }
            const link = product.querySelector("a")
            const hqImage = image.src.replace(/res\[(y|z)\]/ig, 'res[w]');



            return {
                image: image.src,
                title: title.innerText,
                price: price.innerText,
                sale_price: sale_price ? sale_price.innerText : null,
                product_link: link.href,
                hqImage
            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)
    await page.goto(url);
    // await page.waitFor(6000000)
    await page.waitFor('.product-item')

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length < 60) {
        let newArticles = await getArticles(page)
 if(!Array.isArray(newArticles)) {
            newArticles = newArticles._v
        }
newArticles.forEach(article => {
            const alreadyAdded = data.find(x => x.title === article.title)
            if(!alreadyAdded) {
                data.push(article)
            }
        })

        for (let i = 0; i < randomIntFromInterval(5,15); i++) {
            await page.evaluate(e => window.scrollBy(0, 100));
        }
        console.log(data.length)
        await page.waitFor(randomIntFromInterval(500,2000))
    }


    await browser.close();
    return data
}
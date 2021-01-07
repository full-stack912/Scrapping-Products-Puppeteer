const start = require('../helpers/start')
const {randomIntFromInterval} = require("../helpers/helpers")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll("div[id^='product-list-item-']")
        const salesPage =  window.location.pathname.includes("Sale")

        const formated = Array.from(products).map(product => {
            let price, sale_price

            const image = product.querySelector("img")
            // if(image.src.includes("data:image")) {return null}
            const title = product.querySelector("h1")
            if(!title){return null}


            const link = product.querySelector("a")
            if(salesPage) {
                const allPrices = product.querySelectorAll(".price-value")
                price = allPrices[1]
                sale_price = allPrices[0]
            } else {
                price = product.querySelector(".price-value")
            }

            if(!price || !image){return null}
            // const b = image.src.split("&w=")
            // const hqImage = `${b[0]}&w=1208%26h=1506%26q=100`



            return {
                image: image.src,
                title: title.innerText,
                price: `$${price.innerText}`,
                sale_price: sale_price ? `$${sale_price.innerText}` : null,
                hqImage: image.src,
                product_link: link.href,

            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)
    await page.goto(url);
    await page.waitFor("div[id^='product-list-item-']")

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length <= 53) {
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
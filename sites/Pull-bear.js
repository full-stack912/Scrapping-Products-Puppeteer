const start = require('../helpers/start')
const {randomIntFromInterval} = require("../helpers/helpers")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll('.c-tile--product')

        const formated = Array.from(products).map(product => {

            const image = product.querySelector("img")
            const title = product.querySelector(".name")
            if(!title){return null}


            const link = product.querySelector("a")
            const price = product.querySelector(".prices")
            if(!price || !image){return null}
            // const hqImage = image.src.replace("grande.jpg", "1100x1100.jpg")



            return {
                image: image.src,
                title: title.innerText,
                price: price ? price.innerText : null,
                product_link: link.href,
                hqImage: image.src
            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)
    await page.goto(url);
    await page.waitFor('.c-tile--product')

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length <= 60) {
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
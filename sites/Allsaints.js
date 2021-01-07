const start = require('../helpers/start')
const { go } = require("../helpers/proxy_helper")

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)

    console.log(`goto ${url}`)
    await page.goto(url);

    console.log(`wait for .product-item`)
    await page.waitFor('.product-item')

    let data = await page.evaluate(() => {
        const products = document.querySelectorAll('.product-item')
        const salesPage = window.location.pathname.includes("outlet-store")

        console.log("collecting")
        const formated = Array.from(products).map(product => {
            let price, sale_price


            const image = product.querySelector("img")
            const title = product.querySelector(".product-item__name")
            if (salesPage) {
                price = product.querySelector(".product-item__price-old")
                sale_price = product.querySelector(".product-item__price-new")
            } else {
                price = product.querySelector(".product-item__price")
            }

            const link = product.querySelector(".mainImg")
            if (!title || !price || !link) {
                return null
            }
            const b = image.src.split("https://images.allsaints.com/products/")
            const c = b[1].split("/")
            let hqImage = "https://images.allsaints.com/products/900"
            c.forEach((x, index) => {
                if (index !== 0) {
                    hqImage = `${hqImage}/${x}`
                }
            })

            return {
                image: image.src,
                title: title.innerText,
                price: price.innerText,
                product_link: link.href,
                sale_price: sale_price ? sale_price.innerText : null,
                hqImage
            }
        }).filter(x => x)
        return Promise.resolve(formated)

    });

    await browser.close();
    return data
}
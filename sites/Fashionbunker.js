const start = require('../helpers/start')

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)

    console.log(`goto ${url}`)
    await page.goto(url);

    console.log(`waiting for .products`)
    await page.waitFor('.products', { timeout: 120000 })

    console.log('getting data')
    let data = await page.evaluate(() => {
        const products = document.querySelectorAll(".products > ul > li")
        const salesPage = window.location.pathname.includes("sale")

        const formated = Array.from(products).map(product => {
            let price, sale_price
            const image = product.querySelector("img")
            const title = product.querySelector("h2")
            const link = product.querySelector("a")
            if (salesPage) {
                price = product.querySelector(".old-price")
                sale_price = product.querySelector(".special-price")
            } else {
                price = product.querySelector(".price")
            }


            return {
                image: image.src,
                title: title.innerText,
                price: price.innerText,
                sale_price: sale_price ? sale_price.innerText : null,
                product_link: link.href,
                hqImage: image.src
            }
        })
        return Promise.resolve(formated)
    });

    // console.log(data)
    // console.log(typeof data === "object")

    // if (typeof data === "object") {
    //     data = data._v
    // }
    // console.log(data)

    await browser.close();
    return data
}
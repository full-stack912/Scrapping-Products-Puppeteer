const puppeteer = require('puppeteer')

module.exports = async (page) => {
    await page.evaluate(async () => {
        // await new Promise((resolve, reject) => {
        //     var totalHeight = 0;
        //     var distance = 1000;
            
        //     const scroll = () => {
            window.scrollTo(0, document.body.scrollHeight)
            
                // var scrollHeight = document.body.scrollHeight;
                // window.scrollBy(0, distance);
                // totalHeight += distance;
            
        //         if (totalHeight >= scrollHeight) {
        //             resolve();
        //         } else {
        //             setTimeout(scroll, 100)
        //         }
        //     }
        // });
    });
    await page.waitFor(12000)
}
const path = require('path')
var fs = require('fs');

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = async (page, error) => {
    if(!page) {return null}
    try {
        let screenId = uuidv4()

        const p = path.join(process.cwd(), `/screenshots/${screenId}.png`)
        await page.screenshot({path: p, fullPage: true})
        fs.appendFile('screenshots.log', `\nError: ${error} - Path: ${screenId}.png`, function (err) {
            if (err) return console.log(err);
            console.log('Appended!');
        });
    } catch (e) {
        console.log(66, e)
    }

}
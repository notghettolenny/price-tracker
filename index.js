const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const url = 'https://www.amazon.com/Apple-MacBook-Touch-Six-Core-Radeon/dp/B0849W8JK7/ref=sr_1_9?adgrpid=85231329761&gclid=CjwKCAjwve2TBhByEiwAaktM1FHhBSloU9Qt_GRePTgVDSgReCqSGh-v0RKt3pPR9Mjpxae8kcN1wRoCP0YQAvD_BwE&hvadid=585412558537&hvdev=c&hvlocphy=9076649&hvnetw=g&hvqmt=b&hvrand=14641409626517708485&hvtargid=kwd-422398153163&hydadcr=21220_13331737&keywords=macbook+pro+15+inch+2018&qid=1652290587&sr=8-9';

const configBrowser = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

const priceCheck = async (page) => {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    // console.log(html);

    $('#color_name_0_price', html).each(function() {
        let dollarPrice = $(this).text();
        // console.log(dollarPrice);
        let currentPrice = Number(dollarPrice.replace(/[^0-9.-]+/g,""));

        if (currentPrice < 300) {
            console.log("BUY!!!! " + currentPrice);
            sendNotification(currentPrice);
        }
    });
}

 const startTracking = async () =>{
    const page = await configBrowser();
    let job = new CronJob('* */30 * * * *', function() { //runs every 30 minutes in this config
      priceCheck(page);
    }, null, true, null, null, true);
    job.start();
}

const sendNotification = async (price) => {

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '*****@gmail.com',
        pass: '*****'
      }
    });
  
    let textToSend = 'Price dropped to ' + price;
    let htmlText = `<a href=\"${url}\">Link</a>`;
  
    let info = await transporter.sendMail({
      from: '"Price Tracker" <nodeapp@gmail.com>',
      to: "*******@gmail.com",
      subject: 'Price dropped to ' + price, 
      text: textToSend,
      html: htmlText
    });
  
    console.log("Message sent: %s", info.messageId);
  }

startTracking();

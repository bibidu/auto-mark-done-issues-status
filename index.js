require('babel-polyfill');
const puppeteer = require('puppeteer');

// const config = require('./constant-behind')
const config = require('./constant');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    devtools: false,
    defaultViewport: {
      width: 1000,
      height: 700
    },
  })
  console.log('opening page')
  const page = await browser.newPage()
  config.cookies && await page.setCookie(...config.cookies)
  await page.goto(config.url, {
    timeout:0,
    waitUntil: 'networkidle2'
  })
  console.log('页面加载完毕')
  
  let length = 0, detail
  try {
    // 获取issue-list长度
    length = await page.$eval('.issue-list',(el) => 
      Array.from(el.childNodes|| [])
        .filter(
          i => i.tagName.toUpperCase() === 'LI'
        ).length)
    
    for (let i = 0; i < length; i++) {

      // issue详情
      detail = await page.$eval(`.issue-list li:nth-child(${i + 1}) .issue-link-summary`, el => el.innerText)

      await page.click(`.issue-list li:nth-child(${i + 1})`)
      // console.log('点击item')
      
      await page.waitFor('#action_id_5')
      await page.click('#action_id_5')
      // console.log('点击解决问题')
    
      await page.waitFor('#resolution')
      // console.log('点击下拉框')
    
      await page.select('#resolution', '10004')
      // console.log('点击完成')
    
      await page.click('#issue-workflow-transition-submit')
      // console.log('点击解决')

      // const detail = await page.$eval('#summary-val', (el) => el.innerText())

      await page.waitFor(1000)
      console.log(`【${i + 1}】 issue标记完成...`)
      console.log(`    - ${detail}`);  
    }
    browser.close()
  } catch (error) {
    browser.close()
    console.log('error');
    console.log(error)
  }
})()

require('babel-polyfill');
const puppeteer = require('puppeteer');

const config = require('./config')

function parser() {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      defaultViewport: {
        width: 2000,
        height: 700
      },
    })
    
    console.log('opening page')
    const page = await browser.newPage()
    config.iwork_cookies && await page.setCookie(...config.iwork_cookies)
    await page.goto(config.iwork_url, {
      timeout:0,
      waitUntil: 'networkidle2'
    })

    const sendTestSelector = '.integrate-infos .operate-area-node-list .no-before-border button'
    const compileIsRuningSelector = '.tac .el-col-7'
    const compilePackageSelector = '.integrate-infos .operate-node-list-item3 button'
    const compileVersionSelector = '.el-table__expanded-cell .node-item-step-log .node-item-log-wrap ul:nth-child(4) a[class="fr icon-color-green"]'
    // const compileStatusSelector = '.el-table__expanded-cell .icon-color-green'

    let compileVersion
    function isUseful(selector) {
      return page.$eval(selector, el => !el.disabled)
    }
    await page.waitFor(4000)
    await page.click(compilePackageSelector)
    console.log('点击 编译')
    await page.waitFor(2000)
    const timer = setInterval(async () => {
      // const status = await page.$eval(compileStatusSelector, el => el.innerText)
      const useful = await isUseful(sendTestSelector)
      const isCompiling = await page.$eval(compileIsRuningSelector, el => el.offsetWidth)
      // console.log('编译状态', status)
      console.log('送测按钮是否可用', useful)
      console.log('编译黑框的宽度', isCompiling)
      if (isCompiling === 0 && useful) {
        await page.waitFor(2000)
        compileVersion = await page.$eval(compileVersionSelector, el => el.innerText)
        console.log(`compileVersion ${compileVersion}`)

        clearInterval(timer)

        listenCloudServer(browser, compileVersion)
      }
    }, 2000)
  })
  
}
async function listenCloudServer(browser, compileVersion) {
  const upGradeSelector = '.el-table_1_column_10 button:nth-child(3)'
  const versionSelector = '.el-form .el-form-item:nth-child(2) .el-input__inner'
  const closeSelector = '.router-wrpper .el-dialog .dialog-footer button'

  const newPage = await browser.newPage()
  config.cloud_cookies && await newPage.setCookie(...config.cloud_cookies)
  await newPage.goto(config.cloud_url, {
    timeout: 0,
    waitUntil: 'networkidle2'
  })
  const timer2 = setInterval(async () => {
    await newPage.click(upGradeSelector)
    await newPage.waitFor(versionSelector)
    const value = await newPage.$eval(versionSelector, el => el.value)
    console.log(`cloud value ${value}`)
    if (value !== compileVersion) {
      setTimeout(async () => {
        await newPage.click(closeSelector)
      }, 1000)
    } else {
      console.log('部署完成')
    }
  }, 2000)
}

parser()
// module.exports = 
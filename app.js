const Koa = require('koa');
const app = new Koa();
const parser = require('./index')

app.use(async ctx => {
  ctx.body = await parser()
});

app.listen(3000);
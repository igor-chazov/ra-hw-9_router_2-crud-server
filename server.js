const http = require('http');
const path = require('path');
const Koa = require('koa');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const Router = require('koa-router');

const app = new Koa();

app.use(
  cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);

app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

const dirPublic = path.join(__dirname, '/public');
app.use(koaStatic(dirPublic));

let posts = [
  {
    id: 0,
    created: Date.now(),
    content: 'Какая сейчас погода за окном?',
  },
  {
    id: 1,
    created: Date.now(),
    content: 'К сожалению, я не знаю ответа на этот вопрос',
  },
];

let nextId = 1;

const router = new Router();
app.use(router.routes()).use(router.allowedMethods());

router.get('/posts', async (ctx) => {
  ctx.response.body = posts;
});

router.post('/posts', async (ctx) => {
  const { id, content } = JSON.parse(ctx.request.body);

  if (id !== 0) {
    posts = posts.map((o) => (o.id !== id ? o : { ...o, content }));
    ctx.response.status = 204;
    return;
  }

  posts.push({ ...JSON.parse(ctx.request.body), id: nextId += 1, created: Date.now() });
  ctx.response.status = 204;
});

router.delete('/posts/:id', async (ctx) => {
  const postId = Number(ctx.params.id);
  const index = posts.findIndex((o) => o.id === postId);

  if (index !== -1) {
    posts.splice(index, 1);
  }
  ctx.response.status = 204;
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

// eslint-disable-next-line no-console
server.listen(port, () => console.log('Server started'));

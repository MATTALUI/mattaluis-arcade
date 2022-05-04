const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const registry = require('./public/registry.json');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static('public'));

app.get('/play/:game', (req, res, next) => {
  const game = req.params.game;
  if (registry[game]){
    return res.sendFile(`${__dirname}/play.html`);
  } else {
    next();
  }
});

app.get('/', (req, res, next) => {
  return res.sendFile(`${__dirname}/index.html`);
});

app.use('*', (req,res,next)=>{
  return res.sendFile(`${__dirname}/404.html`);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`listening on 0.0.0.0:${port}`);
});

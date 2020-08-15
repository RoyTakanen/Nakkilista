const express = require('express');
const path = require('path');

const app = express()
const port = 8080

app.set('view engine', 'pug')

app.use(express.static('css'))
app.use(express.static('node_modules/vue'))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
  //res.render('index', { title: 'Hey', message: 'Hello there!' })
})

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))

'use strict';
const pug = require('pug')
const port = 8000
const express = require('express')
const app = express()

app.set('view engine', 'pug')

app.get('/', function (req, res) {
  res.render('index', { title: 'Hey',
  message: 'Hello there!',
  name: 'pete'})
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

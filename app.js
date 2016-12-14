'use strict';
let express = require("express");
let app = express();
let pug = require('pug')
let bodyParser = require('body-parser');
let morgan = require('morgan');
const port = 8000

//template engine pug for display
app.set('view engine', 'pug')

//parser added
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//route initiate
let searchRouter = require('./modules/search/router');
app.use('/', searchRouter);

module.exports = app;

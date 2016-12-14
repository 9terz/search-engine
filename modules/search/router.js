'use strict';
let express = require('express');
let router = express.Router();
let SearchController = require('./controller')

router.get('/', SearchController.Index);

router.post('/query', SearchController.ShowResult);
router.post('/debug', SearchController.Debug);
module.exports = router;

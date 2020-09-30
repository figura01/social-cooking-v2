var express = require('express');
var router = express.Router();
const User = require("../models/Users");

/* GET home page. */
router.get('/', (req, res, next) => {

  res.render('index', {
    title: 'Social Cooking'
  });

});

module.exports = router;
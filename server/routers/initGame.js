const express = require('express');
const router = express.Router();
// const testController = require('../controllers/test.js');

router.get('/', function (req, res) {
  res.status(200).send('success');
});

module.exports = router;

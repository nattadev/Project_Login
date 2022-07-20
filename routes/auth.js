const express = require('express');
const router = express.Router();

const userController = require('../controller/userController')

router.get('/', userController.index);

router.post('/register',userController.register);

module.exports = router
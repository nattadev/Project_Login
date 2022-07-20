const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const userController = require('../controller/userController')

//http://localhost:5050/user
router.get('/', userController.index);

//http://localhost:5050/login
router.post('/login',userController.login)

//http://localhost:5050/register
router.post('/register',[
  body('name').not().isEmpty().withMessage('กรุณาป้อนข้อมูลชื่อด้วย'),
  body('email').not().isEmpty().withMessage('กรุณากรอกอีเมล์ด้วย').isEmail().withMessage('รูปแบบอีเมล์ไม่ถูกต้อง'),
  body('password').not().isEmpty().withMessage('กรุณากรอกรหัสผ่านด้วย').isLength({min: 3}).withMessage('รหัสผ่านต้อง 3 ตัวอักษรขึ้นไป'),
]
,userController.register);

module.exports = router
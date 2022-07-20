const UserModel = require('../model/User')
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.index = async (req, res) => {
    try {
      const users = await UserModel.find();
      res.json({ error: false, users });
    } catch (error) {
      console.log(error);
      res.json({ error: true, users: null });
    }
  }

  exports.register = async (req,res) => {
    try {
        const { name, email, password } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const existEmail = await UserModel.findOne({email : email})
        if(existEmail){
            return  res.status(400).json({
                message: 'อีเมลซ้ำ'
            })
        }

        let user = new UserModel();
        user.name = name
        user.email = email;
        user.password = await user.encryptPassword(password) ;

       await user.save()

       return  res.status(201).json({
        message: 'ลงทะเบียนเรียบร้อย'
    });  
         

    } catch (error) {
        console.log(error);
        
    }
  }


  exports.login = async (req,res) => {
    try {
        const { email, password } = req.body;

        const userCheck = await UserModel.findOne({email : email})
        if(!userCheck){
            return  res.status(400).json({
                message: 'ไม่มีผู้ใช้งานในระบบ'
            })
        }

        const isValid = await userCheck.checkPassword(password);
        if (!isValid) {
            return  res.status(400).json({
                message: 'รหัสผ่านไม่ถูกต้อง'
            })
        }

        const token = await jwt.sign({
            id: userCheck.id
        },'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJ',{expiresIn: '1 day'})

        const expires_in = jwt.decode(token)

       return  res.status(201).json({
        access_token : token ,
        expiresIn : expires_in.exp,
        token_type: 'Bearer',
        message: 'ล็อกอินสำเร็จ'
    });  
         

    } catch (error) {
        console.log(error);
        
    }
  }
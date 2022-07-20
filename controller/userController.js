const UserModel = require('../model/User')

exports.index = async (req, res) => {
    try {
      const users = await UserModel.find();
      res.json({ error: false, users });
    } catch (error) {
      console.log(error);
      res.json({ error: true, users: null });
    }
  }

  exports.register = async (req,res,next) => {
    try {
        const {name,email,password} = req.body

        let user = new UserModel()
        user.name = name
        user.email = email
        user.password = password

       await user.save()

       return  res.status(201).json({
        message: 'ลงทะเบียนเรียบร้อย'
    });  
         

    } catch (error) {
        console.log(error);
        
    }
  }
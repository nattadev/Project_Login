const router = require('express').Router()
const User = require('../model/User')

router.get ('/',async (req,res) => {
    const users = await User.findOne()
    res.status(200).json({
      data : users
    })
})

router.post('/register',async (req,res) => {
  const user = new User({
    name : req.body.name,
    email : req.body.email,
    password : req.body.password
  })
  try{
   const savedUser = await await user.save()
   res.status(200).send({ user: savedUser})

  }catch (err) {
    res.status(400).send({status : 'Failed' , msg: err})
  }
})


module.exports = router
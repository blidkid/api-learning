const router = require('express').Router();
const verifyAuth = require('./verifyToken');
const User = require('../model/User');

router.get("/", verifyAuth, async (req, res) => {
  let user = await User.findById(req.user._id)
  res.send(user);
});

module.exports = router;
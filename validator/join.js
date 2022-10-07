const { body } = require('express-validator');
require('dotenv').config();

module.exports = () => [
  body('password')
  //  no need to hash password, since it's stored in .env
    .custom((val) => process.env.MEMBER_PASSWORD === val)
    .withMessage('Incorrect password')
]
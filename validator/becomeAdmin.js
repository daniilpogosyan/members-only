const { body } = require('express-validator');
require('dotenv').config();

module.exports = () => [
  body('password')
  //  no need to hash password, since it's stored in .env
    .equals(process.env.ADMIN_PASSWORD)
    .withMessage('Incorrect password')
]
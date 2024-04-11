const express = require('express')
const router = express.Router()
const formController = require('../controllers/formController')


router.post('/newRegister', formController.register)


module.exports = router
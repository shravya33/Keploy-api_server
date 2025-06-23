const express = require('express');
const router = express.Router();

const controller = require('./controller.js')

router.post('/create',controller.createUser);
router.get('/',controller.getCustomer);
router.patch('/:id',controller.customerupdate);
router.delete('/:id',controller.customerDelete);

module.exports = router;
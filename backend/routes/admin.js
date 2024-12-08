const router = require('express').Router();
const ProfCtrl = require('../controllers/prof');

router.get('/professionals', ProfCtrl.readProfessionalsByAdmin);

module.exports = router;

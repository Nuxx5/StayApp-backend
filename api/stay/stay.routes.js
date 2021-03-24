const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {addStay, getStays, getStay, updateStay, deleteStay} = require('./stay.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getStays)  // log, 
router.post('/', addStay) //requireAuth
router.delete('/:id', deleteStay) //requireAuth
router.get('/:id', log, getStay)
router.put('/:id',   updateStay)
module.exports = router
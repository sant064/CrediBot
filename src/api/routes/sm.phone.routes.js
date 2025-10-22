// /routes/phone.routes.js

const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/sm.phoneController'); // Adjust path as needed

// GET route: Fetch by phone or create if not found
// Example URL: /api/phone/123456789
router.get('/:telefono', phoneController.getOrCreateRecordByPhone);

// PATCH route: Update by phone
// Example URL: /api/phone/123456789
router.patch('/:telefono', phoneController.updateRecordByPhone);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} = require('../controllers/policyController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getPolicies)
  .post(protect, authorize('Admin'), createPolicy);

router.route('/:id')
  .put(protect, authorize('Admin'), updatePolicy)
  .delete(protect, authorize('Admin'), deletePolicy);

module.exports = router;

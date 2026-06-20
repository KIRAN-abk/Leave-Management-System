const express = require('express');
const router = express.Router();
const {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('Admin', 'Manager'), getEmployees)
  .post(protect, authorize('Admin'), createEmployee);

router.route('/:id')
  .put(protect, authorize('Admin'), updateEmployee)
  .delete(protect, authorize('Admin'), deleteEmployee);

module.exports = router;

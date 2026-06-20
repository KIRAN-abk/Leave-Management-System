const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getLeaves,
  actionLeave,
  getLeaveStats,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Stats route should come BEFORE dynamic ID routes
router.get('/stats', protect, getLeaveStats);

router.route('/')
  .get(protect, getLeaves)
  .post(protect, upload.single('attachment'), applyLeave);

router.put('/:id/action', protect, authorize('Admin', 'Manager'), actionLeave);

module.exports = router;

const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const {
  addCollaborator,
  removeCollaborator,
  updateCollaboratorRole
} = require('../controllers/collaboratorController');

router.use(protect);

router.post('/', addCollaborator);
router.delete('/:userId', removeCollaborator);
router.put('/:userId', updateCollaboratorRole);

module.exports = router;
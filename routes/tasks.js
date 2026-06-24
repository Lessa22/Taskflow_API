const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { createTask, getTasks, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { taskValidator, validate } = require('../validators/taskValidators');

router.use(protect);

router.post('/', taskValidator, validate, createTask);
router.get('/', getTasks);
router.get('/:taskId', getTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
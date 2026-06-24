const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createProject, getProjects, getProject, updateProject, deleteProject } = require('../controllers/projectController');
const { projectValidator, validate } = require('../validators/projectValidators');

router.use(protect);

router.post('/', projectValidator, validate, createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', projectValidator, validate, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
const Task = require('../models/Task');
const Project = require('../models/Project');

// Check if user has access to the project
const hasProjectAccess = (project, userId) => {
  const isOwner = project.owner.toString() === userId.toString();
  const isCollaborator = project.collaborators.some(
    c => c.user.toString() === userId.toString()
  );
  return isOwner || isCollaborator;
};

// Create a task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!hasProjectAccess(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      project: projectId,
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Task created', task });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all tasks for a project
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!hasProjectAccess(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Filters from query params
    const filter = { project: projectId };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ tasks });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!hasProjectAccess(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ task });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!hasProjectAccess(project, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo || task.assignedTo;

    await task.save();

    res.status(200).json({ message: 'Task updated', task });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);

    // Only owner or task creator can delete
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isCreator) {
      return res.status(403).json({ message: 'Not allowed to delete this task' });
    }

    await task.deleteOne();

    res.status(200).json({ message: 'Task deleted' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
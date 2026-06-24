const Project = require('../models/Project');

// Create a new project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id
    });

    res.status(201).json({ message: 'Project created', project });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all projects with search and filters
const getProjects = async (req, res) => {
  try {
    const filter = {
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    };

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Search by name
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const projects = await Project.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: projects.length, projects });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single project
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      c => c.user._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ project });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the owner can update
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can update this project' });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.status = status || project.status;

    await project.save();

    res.status(200).json({ message: 'Project updated', project });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this project' });
    }

    await project.deleteOne();

    res.status(200).json({ message: 'Project deleted' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject };
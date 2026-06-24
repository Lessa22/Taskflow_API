const Project = require('../models/Project');
const User = require('../models/User');

// Add a collaborator to a project
const addCollaborator = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can add collaborators
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can add collaborators' });
    }

    // Find the user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Can't add yourself
    if (userToAdd._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You are already the owner' });
    }

    // Check if already a collaborator
    const alreadyAdded = project.collaborators.some(
      c => c.user.toString() === userToAdd._id.toString()
    );
    if (alreadyAdded) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    project.collaborators.push({ user: userToAdd._id, role: role || 'viewer' });
    await project.save();

    res.status(200).json({ message: 'Collaborator added', project });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove a collaborator
const removeCollaborator = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can remove collaborators
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can remove collaborators' });
    }

    // Remove the collaborator
    project.collaborators = project.collaborators.filter(
      c => c.user.toString() !== req.params.userId
    );

    await project.save();

    res.status(200).json({ message: 'Collaborator removed', project });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update collaborator role
const updateCollaboratorRole = async (req, res) => {
  try {
    const { role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can update roles
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can update roles' });
    }

    const collaborator = project.collaborators.find(
      c => c.user.toString() === req.params.userId
    );

    if (!collaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }

    collaborator.role = role;
    await project.save();

    res.status(200).json({ message: 'Role updated', project });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addCollaborator, removeCollaborator, updateCollaboratorRole };
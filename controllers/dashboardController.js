const Project = require('../models/Project');
const Task = require('../models/Task');

// Get dashboard statistics
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // All projects the user owns or collaborates on
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ]
    });

    const projectIds = projects.map(p => p._id);

    // All tasks in those projects
    const tasks = await Task.find({ project: { $in: projectIds } });

    // Count tasks by status
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;

    // Tasks assigned to me
    const myTasks = tasks.filter(
      t => t.assignedTo && t.assignedTo.toString() === userId.toString()
    );

    // Overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(
      t => t.dueDate && t.dueDate < now && t.status !== 'done'
    );

    // Count projects by status
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    res.status(200).json({
      projects: {
        total: projects.length,
        active: activeProjects,
        completed: completedProjects
      },
      tasks: {
        total: tasks.length,
        todo: todoCount,
        inProgress: inProgressCount,
        done: doneCount,
        assignedToMe: myTasks.length,
        overdue: overdueTasks.length
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getDashboard };
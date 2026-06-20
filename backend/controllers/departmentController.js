const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (Admin, Manager)
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).populate('manager', 'name email');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a department
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res) => {
  const { name, description, manager } = req.body;

  try {
    const departmentExists = await Department.findOne({ name });
    if (departmentExists) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    // Verify manager if provided
    if (manager) {
      const managerUser = await User.findById(manager);
      if (!managerUser) {
        return res.status(404).json({ message: 'Assigned manager user not found' });
      }
    }

    const department = await Department.create({
      name,
      description,
      manager: manager || null
    });

    const populatedDept = await Department.findById(department._id).populate('manager', 'name email');
    res.status(201).json(populatedDept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res) => {
  const { name, description, manager } = req.body;

  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Verify manager if provided and changed
    if (manager && manager !== department.manager?.toString()) {
      const managerUser = await User.findById(manager);
      if (!managerUser) {
        return res.status(404).json({ message: 'Assigned manager user not found' });
      }
    }

    department.name = name || department.name;
    department.description = description !== undefined ? description : department.description;
    department.manager = manager !== undefined ? (manager || null) : department.manager;

    const updatedDepartment = await department.save();
    const populatedDept = await Department.findById(updatedDepartment._id).populate('manager', 'name email');
    
    res.json(populatedDept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Remove department link from users
    await User.updateMany({ department: req.params.id }, { department: null });

    await Department.findByIdAndDelete(req.params.id);

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

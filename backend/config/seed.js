const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const LeavePolicy = require('../models/LeavePolicy');
const LeaveRequest = require('../models/LeaveRequest');
require('dotenv').config();

const seedDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leave_management';
    
    // Connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connStr);
    }
    
    console.log('Seeding database...');

    // Clear existing data (optional, but good for reset/seeding)
    await User.deleteMany({});
    await Department.deleteMany({});
    await LeavePolicy.deleteMany({});
    await LeaveRequest.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Seed Policies
    const policiesData = [
      { name: 'Annual Leave', days: 21, description: 'Paid time off for holidays or personal recreation' },
      { name: 'Sick Leave', days: 10, description: 'Paid time off for personal illness or medical appointments' },
      { name: 'Casual Leave', days: 7, description: 'Paid leave for short-term personal emergencies' }
    ];
    const policies = await LeavePolicy.insertMany(policiesData);
    console.log(`Seeded ${policies.length} leave policies.`);

    // Map leave balances structure
    const initialBalances = policies.map(p => ({
      leaveType: p._id,
      allocated: p.days,
      used: 0
    }));

    // 2. Seed Departments
    const engineeringDept = await Department.create({
      name: 'Engineering',
      description: 'Software development, product engineering, QA, and devops'
    });
    const hrDept = await Department.create({
      name: 'Human Resources',
      description: 'Employee relations, recruitment, and organizational development'
    });
    const salesDept = await Department.create({
      name: 'Sales',
      description: 'Customer acquisition, accounts, and client relationships'
    });
    console.log('Seeded departments.');

    // 3. Seed Users
    // Admin User
    const admin = new User({
      name: 'Jane Admin',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'Admin',
      department: hrDept._id,
      leaveBalances: initialBalances,
      joinedDate: new Date('2024-01-10'),
      status: 'Active'
    });
    await admin.save();

    // Managers
    const managerEng = new User({
      name: 'John Manager',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'Manager',
      department: engineeringDept._id,
      leaveBalances: initialBalances,
      joinedDate: new Date('2024-02-15'),
      status: 'Active'
    });
    await managerEng.save();

    const managerSales = new User({
      name: 'Bob SalesManager',
      email: 'bob.sales@company.com',
      password: 'password123',
      role: 'Manager',
      department: salesDept._id,
      leaveBalances: initialBalances,
      joinedDate: new Date('2024-03-20'),
      status: 'Active'
    });
    await managerSales.save();

    const managerHr = new User({
      name: 'Emma HRManager',
      email: 'emma.hr@company.com',
      password: 'password123',
      role: 'Manager',
      department: hrDept._id,
      leaveBalances: initialBalances,
      joinedDate: new Date('2024-04-12'),
      status: 'Active'
    });
    await managerHr.save();

    // Employees
    const employeeAlice = new User({
      name: 'Alice Employee',
      email: 'employee@company.com',
      password: 'employee123',
      role: 'Employee',
      department: engineeringDept._id,
      manager: managerEng._id,
      leaveBalances: initialBalances,
      joinedDate: new Date('2024-06-01'),
      status: 'Active'
    });
    await employeeAlice.save();

    const employeeCharlie = new User({
      name: 'Charlie Employee',
      email: 'charlie@company.com',
      password: 'password123',
      role: 'Employee',
      department: engineeringDept._id,
      manager: managerEng._id,
      leaveBalances: initialBalances,
      joinedDate: new Date('2024-07-15'),
      status: 'Active'
    });
    await employeeCharlie.save();

    const employeeDavid = new User({
      name: 'David Employee',
      email: 'david@company.com',
      password: 'password123',
      role: 'Employee',
      department: salesDept._id,
      manager: managerSales._id,
      leaveBalances: initialBalances,
      joinedDate: new Date('2024-08-01'),
      status: 'Active'
    });
    await employeeDavid.save();

    const employeeFiona = new User({
      name: 'Fiona Employee',
      email: 'fiona@company.com',
      password: 'password123',
      role: 'Employee',
      department: hrDept._id,
      manager: managerHr._id,
      leaveBalances: initialBalances,
      joinedDate: new Date('2024-09-10'),
      status: 'Active'
    });
    await employeeFiona.save();

    const employeeGeorge = new User({
      name: 'George Employee',
      email: 'george@company.com',
      password: 'password123',
      role: 'Employee',
      department: engineeringDept._id,
      manager: managerEng._id,
      leaveBalances: initialBalances,
      joinedDate: new Date('2024-10-05'),
      status: 'Active'
    });
    await employeeGeorge.save();

    const employeeHannah = new User({
      name: 'Hannah Employee',
      email: 'hannah@company.com',
      password: 'password123',
      role: 'Employee',
      department: salesDept._id,
      manager: managerSales._id,
      leaveBalances: initialBalances,
      joinedDate: new Date('2024-11-12'),
      status: 'Active'
    });
    await employeeHannah.save();

    // Assign manager as Department head for Engineering
    engineeringDept.manager = managerEng._id;
    await engineeringDept.save();

    // Assign manager as Department head for Sales
    salesDept.manager = managerSales._id;
    await salesDept.save();

    // Assign manager as Department head for HR
    hrDept.manager = managerHr._id;
    await hrDept.save();

    console.log('Seeded Admin, Manager, and Employee users.');
    console.log('Data seeding complete!');

    // Close connection if run directly
    if (require.main === module) {
      mongoose.connection.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

// Check if run directly
if (require.main === module) {
  seedDB();
}

module.exports = seedDB;

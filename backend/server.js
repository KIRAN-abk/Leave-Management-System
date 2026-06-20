const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const seedDB = require('./config/seed');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // In production, replace with specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Import routes
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const policyRoutes = require('./routes/policyRoutes');
const leaveRoutes = require('./routes/leaveRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/leaves', leaveRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Leave Management System API is running...' });
});

// Auto-seed database if empty
const autoSeed = async () => {
  try {
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      console.log('User database is empty. Auto-seeding database...');
      await seedDB();
    }
  } catch (error) {
    console.error('Auto-seed verification failed:', error.message);
  }
};
autoSeed();

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

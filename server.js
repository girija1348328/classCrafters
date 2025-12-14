const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Import route files (NOT controllers)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/education-types', require('./routes/educationTypeRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/institutions', require('./routes/institutionRoutes'));
app.use('/api/phases', require('./routes/phaseRoutes'));
app.use('/api/main-groups', require('./routes/mainGroupRoutes'));
app.use('/api/sub-groups', require('./routes/subGroupRoutes'));
app.use('/api/custom-fields', require('./routes/customFieldRoutes'));
app.use('/api/student-registrations', require('./routes/studentRegistrationRoutes'));
app.use('/api/classrooms', require('./routes/classRoomRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
// app.use('/api/staff-registrations', require('./routes/staffRegistrationRoutes'));
app.use('/api/fee-structures', require('./routes/feeStructureRoutes'));
app.use('/api/fee-assignments', require('./routes/feeAssignmentRoutes'));
app.use('/api/fee-payments', require('./routes/feePaymentRoutes'));

app.use('/api/attendance', require('./routes/attendanceRoutes'));

app.get('/', (req, res) => {
  res.send('Education Portal API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

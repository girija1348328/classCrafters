const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const http = require('http');
const { initSocket } = require('./sockets/chat.socket');

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
app.use('/api/staff-registrations', require('./routes/staffRegistrationRoutes'));
app.use('/api/classrooms', require('./routes/classRoomRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
// app.use('/api/staff-registrations', require('./routes/staffRegistrationRoutes'));
app.use('/api/fee-structures', require('./routes/feeStructureRoutes'));
app.use('/api/fee-assignments', require('./routes/feeAssignmentRoutes'));
app.use('/api/fee-payments', require('./routes/feePaymentRoutes'));

app.use('/api/attendance', require('./routes/attendanceRoutes'));

app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/quizzes', require('./routes/quizzRoutes'));

app.get('/', (req, res) => {
  res.send('Education Portal API is running...');
});

// 👉 Create a real HTTP server
const server = http.createServer(app);

// 👉 Initialize socket and attach to server
initSocket(server);

// 👉 Start listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
);

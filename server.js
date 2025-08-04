const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Import route files (NOT controllers)
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
// app.use('/api/staff-registrations', require('./routes/staffRegistrationRoutes'));

app.get('/', (req, res) => {
  res.send('Education Portal API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

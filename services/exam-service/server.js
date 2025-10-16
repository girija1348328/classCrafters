const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const examRoutes = require('./src/routes/examRoutes');

dotenv.config();

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.EXAM_SERVICE_PORT || 3002;

app.use(express.json());

// Use the exam routes
app.use('/api/exam', examRoutes);

app.get('/', (req, res) => {
    res.send('Exam Service is running!');
});

app.listen(PORT, () => {
    console.log(`Exam Service is listening on port ${PORT}`);
});
const express =  require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const checkRoutes = require('./routes/checkRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB Connected Successfully');
    } catch(error){
        console.log('Error:', error);
        process.exit(1);
    }
};

connectDB();

app.get('/', (req, res) => {
    res.send('Welcome to Visitor Pass Management System Server');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/check', checkRoutes);

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is up and running on http://localhost:${port}`);
});
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const { swaggerSetup, swaggerDocs } = require('./swagger-config');
const { connectToDatabase, getUsersCollection } = require('./models/db');
const { ObjectId } = require('mongodb');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);

const port = 3001;

app.set('trust proxy', 1);

app.use((req, res, next) => {
    if (req.hostname === 'louis1618-blog.onrender.com') {
        return res.redirect(301, `https://blog.louis1618.shop${req.originalUrl}`);
    }
    next();
});

connectToDatabase();

// 미들웨어 설정
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    }
}));

app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/dev-tools/docs/apis', swaggerSetup, swaggerDocs);

app.use(async (req, res, next) => {
    if (req.session.user && req.session.user.id) {
        const usersCollection = getUsersCollection();
        const updatedUser = await usersCollection.findOne({ _id: new ObjectId(req.session.user.id) });
        if (updatedUser) {
            req.session.user.user_handle = updatedUser.userHandle;
            req.session.user.rank = updatedUser.rank;
            req.session.save((err) => {
                if (err) {
                    console.error("세션 저장 중 오류 발생:", err);
                }
            });
        }
    }
    next();
});

app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

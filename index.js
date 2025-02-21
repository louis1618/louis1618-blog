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
const randomstring = require('randomstring');
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

app.use(express.static(path.join(__dirname, 'client/dist')));

app.use('/dev-tools/docs/apis', swaggerSetup, swaggerDocs);

async function generateUniqueUserHandle(usersCollection) {
    let userHandle;
    let isUnique = false;
    
    while (!isUnique) {
        userHandle = `user-${randomstring.generate({ length: 6, charset: 'numeric' })}`;
        const existingUser = await usersCollection.findOne({ userHandle });
        if (!existingUser) {
            isUnique = true;
        }
    }
    return userHandle;
}

async function generateRandomDisplayName() {
    return `User_${randomstring.generate({ length: 8, charset: 'alphabetic' })}`;
}

app.use(async (req, res, next) => {
    if (req.session.user && req.session.user.id) {
        try {
            const usersCollection = getUsersCollection();
            const updatedUser = await usersCollection.findOne({ _id: new ObjectId(req.session.user.id) });

            if (!updatedUser) {
                req.session.destroy((err) => {
                    if (err) {
                        console.error("세션 삭제 중 오류 발생:", err);
                    }
                    res.clearCookie('connect.sid');
                    return res.status(401).send('오류가 발생했습니다. 다시 로그인해주세요.');
                });
                return;
            }

            // user.DisplayName 없으면 생성
            if (!updatedUser.DisplayName) {
                updatedUser.DisplayName = await generateRandomDisplayName();
                await usersCollection.updateOne({ _id: updatedUser._id }, { $set: { DisplayName: updatedUser.DisplayName } });
            }

            // user.userHandle 없으면 생성
            if (!updatedUser.userHandle) {
                updatedUser.userHandle = await generateUniqueUserHandle(usersCollection);
                await usersCollection.updateOne({ _id: updatedUser._id }, { $set: { userHandle: updatedUser.userHandle } });
            }

            // user.rank가 없으면 기본값 0 설정
            if (updatedUser.rank === undefined) {
                updatedUser.rank = 0;
                await usersCollection.updateOne({ _id: updatedUser._id }, { $set: { rank: updatedUser.rank } });
            }

            // 세션에 업데이트된 사용자 정보 저장
            req.session.user.display_name = updatedUser.DisplayName;
            req.session.user.user_handle = updatedUser.userHandle;
            req.session.user.rank = updatedUser.rank;

            req.session.save((err) => {
                if (err) {
                    console.error("세션 저장 중 오류 발생:", err);
                }
            });

        } catch (error) {
            console.error("유저 조회 중 오류 발생:", error);
            return res.status(500).send('서버 오류');
        }
    }
    next();
});

app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

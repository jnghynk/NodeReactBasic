const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require("./config/key");

const { User } = require("./models/User");

//application/x-www-form-urlencoded 데이터를 분석해서 가져옴
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 데이터를 분석해서 가져옴
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! 안녕하세요??");
});

app.post("/register", (req, res) => {
  // 회원가입 시 필요한 정보들을 client에서 가져오면
  // 데이터베이스에 저장

  const user = new User(req.body);

  // 몽고db에 저장
  user.save((err, userInfo) => {
    // error 있을 경우 json 형식으로 전달
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/login", (req, res) => {

  // 요청된 이메일을 db에서 있는지 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    // 요청된 이메일이 db에 있다면 비밀번호 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      //console.log(err);
      
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      // 비밀번호까지 맞다면, 토큰을 생성
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
        res.cookie("x_auth", user.token)
        .status(200)
        .json({ loginSuccess: true, userId: user._id })
      })

    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');

const config = require('./config/key');

const { User } = require("./models/User");

//application/x-www-form-urlencoded 데이터를 분석해서 가져옴
app.use(bodyParser.urlencoded({extended: true}));

//application/json 데이터를 분석해서 가져옴
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! 안녕하세요??')
})

app.post('/register', (req, res) => {

  // 회원가입 시 필요한 정보들을 client에서 가져오면
  // 데이터베이스에 저장

  const user = new User(req.body)

  // 몽고db에 저장
  user.save((err, userInfo) => {
    // error 있을 경우 json 형식으로 전달
    if(err) return res.json({ success: false, err})
    return res.status(200).json({
      success: true
    })
  })

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, 
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50 
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// db에 정보 저장하기 전에 실행됨
userSchema.pre('save', function( next ){
    var user = this;

    // user의 비밀번호 변경된 경우만 암호화
    if(user.isModified('password')) {
        // user의 비밀번호를 암호화 시킨다. 
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }

})

userSchema.methods.comparePassword = function(plainPassword, cb) {

    // plainPassword 1234567    암호화된 비밀번호 $2b$10$y8cdFelQThAKH0sgOP.PpONsR2a/C2n3faABbmbm1nSjNFaG9uQcW
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err)
            cb(null, isMatch)
    })

}

userSchema.methods.generateToken = function(cb) {

    var user = this;
    
    // jsonwebtoken을 이용해서 token을 생성
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secretToken' = token 
    // ->
    // 'secretToken' -> user._id 

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })


}

const User = mongoose.model('User', userSchema)

module.exports = { User }
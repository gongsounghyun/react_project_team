const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = mongoose.Schema({
    userId : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    commentId : {
        type : Schema.Types.ObjectId,
        ref : 'Comment'
    },
    videoId : {
        type : Schema.Types.ObjectId,
        ref : 'Video'
    }
}, { timestamps: true }) //만든 날짜와 update시 날짜가 표시가 된다.


const Like = mongoose.model('Like', likeSchema); //1st모델의이름,2nd데이터

module.exports = { Like }
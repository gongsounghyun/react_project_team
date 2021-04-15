const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DislikeSchema = mongoose.Schema({
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


const Dislike = mongoose.model('Dislike', DislikeSchema); //1st모델의이름,2nd데이터

module.exports = { Dislike }
const express = require('express');
const router = express.Router();
const { Video } = require("../models/Video");
const { Subscriber } = require("../models/Subscriber");

const { auth } = require("../middleware/auth");
const multer = require("multer");
var ffmpeg = require("fluent-ffmpeg")

let storge = multer.diskStorage({
    destination: (req, res, cb) => { // 파일을 어디에 저장할지 설명
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {  // 
        cb(null, `${Date.now()}_${file.originalname}`);
    },
    fileFilter:(req, file, cb) => {
        const ext = path.extname(file.originalname)
        if(ext !== '.mp4'|| ext !== '.png'){
            return cb(res.status(400).end('only jpg, png, mp4. is allowed'), false);
        }
        cb(null, true);
    }
});

const upload = multer({ storage : storge }).single("file"); // single 하나의 파일만 가능

//=================================
//             Video
//=================================

router.post("/uploadVideo", (req, res)=> {
    //비디오 정보들을 저장한다.
    const video = new Video(req.body);
    video.save((err, doc) => {
        if(err) return res.json({ success : false, err})
        res.status(200).json({ success : true})
    })

})

router.post("/uploadfiles", (req, res)=> {
    //비디오를 서버에 저장한다.
    upload(req, res, err => {
        if(err){
             return res.json({ success : false, err });
        }
        return res.json({ success : true, url : res.req.file.path, filename : res.req.file.filename })
    })
})

router.get("/getVideos", (req, res)=> {
  //비디오를 데이터베이스에서 가져와서 클라이언트에 보낸다.
  Video.find()//Video collection에있는 모든 데이터들을 찾는다.
      .populate('writer')//writer에 type으로 Schema.Types.ObjectId라고 지정을 해주었었는데 populate를 걸어줘야 user에있는 모든 데이터들을 들고올 수있다.
      //populate를 안걸어 줄 경우 writer의 id만 가져온다.
      .exec((err, videos) => {
          if(err) return res.status(400).send(err);
          res.status(200).json({ success : true, videos });
      })
})

router.post("/getVideoDetail", (req, res) => {
  Video.findOne({ _id: req.body.videoId }) //id를 이용해서 찾고 클라이언트에서 보낸 비디오 아이디를 찾는다.
    .populate("writer") // 모든 정보를 가져오게 하기 위해서
    .exec((err, videoDetail) => {
      if (err) return res.status(400).send(err);
      return res.status(200).json({ success: true, videoDetail });
    });
});


router.post("/getSubscriptionVideos", (req, res) => {
  //자신의 아이디를 가지고 구독하는 사람들을 찾는다.
  Subscriber.find({ userFrom: req.body.userFrom }).exec(
    (err, subscriberInfo) => {
      console.log(subscriberInfo);
      if (err) return res.status(400).send(err);

      let subscribedUser = [];

      subscriberInfo.map((subscriber, index) => {
        subscribedUser.push(subscriber.userTo);
      });
      //찾은 사람들의 비디오를 가지고온다.
      Video.find({ writer: { $in: subscribedUser } }) //subscribedUser배열안에있는 모든 데이터를 writer에 대입함
        .populate("writer")
        .exec((err, videos) => {
          if (err) return res.status(400).send(err);
          res.status(200).json({ success: true, videos });
        });
    }
  );
});


router.post("/thumbnail", (req, res) => {
    //썸네일 생성 하고 비디오 러닝타임도 가져오는 api
  
    let fileDuration = "";
    let filePath = "";
    //비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.url, function (err, metadata) {
      //url을 받으면 해당 비디오에대한 정보가 metadata에담김
      console.log(metadata); //metadata안에담기는 모든정보들 체킹
      fileDuration = metadata.format.duration; //동영상길이대입
    });
    //썸네일 생성
    ffmpeg(req.body.url) //클라이언트에서보낸 비디오저장경로
      .on("filenames", function (filenames) {
        //해당 url에있는 동영상을 밑에 스크린샷옵션을 기반으로
        //캡처한후 filenames라는 이름에 파일이름들을 저장
        console.log("will generate " + filenames.join(","));
        console.log("filenames:", filenames);
  
        filePath = "uploads/thumbnails/" + filenames[0];
      })
      .on("end", function () {
        console.log("Screenshots taken");
        return res.json({
          success: true,
          url: filePath,
          fileDuration: fileDuration,
        });
        //fileDuration :비디오 러닝타임
      })
      .on("error", function (err) {
        console.log(err);
        return res.json({ success: false, err });
      })
      .screenshots({
        //Will take screenshots at 20% 40% 60% and 80% of the video
        count: 3,
        folder: "uploads/thumbnails",
        size: "320x240",
        //'%b':input basename(filename w/o extension) = 확장자제외파일명
        filename: "thumbnail-%b.png",
      });
  });

module.exports = router;

const express = require('express');
const router = express.Router();
const { Subscriber } = require("../models/Subscriber");


//=================================
//             Subscribe
//=================================

router.post("/subscribeNumber", (req, res)=> {

    Subscriber.find({ 'userTo' : req.body.userTo })
    .exec((err, subscribe) => {
        if(err) return res.status(400).send(err)
        return res.status(200).json({ success : true, subscribeNumber : subscribe.length })
    })
})

router.post("/subscribed", (req, res)=> {

    Subscriber.find({ 'userTo' : req.body.userTo, 'userFrom' : req.body.userFrom })
    .exec(( err, subscribe ) => {
        if(err) return res.status(400).send(err)
        let result = false
        if(subscribe.length !== 0){
            result = true
        }
        res.status(200).json({ success : true, subscribed : result })
    })
})

router.post("/unSubscribe", (req, res) => {
    Subscriber.findOneAndDelete({
      userTo: req.body.userTo,
      userFrom: req.body.userFrom,
    }).exec((err, doc) => {
      if (err) return res.status(400).json({ success: false, err });
      res.status(200).json({ success: true, doc });
    });
  });
  
  router.post("/Subscribe", (req, res) => {
    const subscribe = new Subscriber(req.body); // 저장할 인스턴스를 만들고 데이터를 저장한다.
    subscribe.save((err, doc) => { // 데이터베이스에 저장
      if (err) return res.json({ success: false, err });
      res.status(200).json({ success: true });
    });
  });


module.exports = router;

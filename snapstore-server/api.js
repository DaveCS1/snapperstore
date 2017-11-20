/*
**  api.js
*/

const express = require('express');
const ssconfig = require("./config.json");
const utils = require("./utils.js");

const { MediaProject } = require('./models/ssmodels');
var router = express.Router();
module.exports = router;


const multer  = require('multer');
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const checkTodayDir = utils.todayDir();
    utils.checkDir(checkTodayDir);
    cb(null, `public/uploads/${checkTodayDir}`)
  },
  filename: function (req, file, cb) {        
    let ext = utils.getExt(file);
    cb(null, utils.createUploadFilename(`.${ext}`));
  }
})

let multerUpload = multer({ storage: storage })
let uploadFile = multerUpload.single('thefile');

router.post('/gettags', function(req, res, next) {
  
  let returnObj = {};
  if (req.body.tagquery === undefined ||
    req.body.tagquery === '') {
    res.send('none');
  }

  const tAry = req.body.tagquery.split(/ +/);
  console.log(tAry);

  MediaProject.find({ tags: { $all: tAry }})
  .exec(function(err, existingMedia) {   
    if (err) { return next(err); }

    returnObj.status = 'ok';
    returnObj.mediaInfo = existingMedia;
    res.writeHead(200, {"Content-Type": "application/json"});
    // res.end(JSON.stringify(existingVideoSessions));
    res.end(JSON.stringify(returnObj));

  })
})

router.post('/synctags', function(req, res, next) {
  

  // needs much better error handling
  if (req.body.tagquery === undefined ||
    req.body.tagquery === '') {
    res.writeHead(200, {"Content-Type": "application/json"});
    // res.end(JSON.stringify(existingVideoSessions));
    res.end(JSON.stringify( { status: 'error'}));
    return;
  }

  const id = req.body.id;
  const tags = req.body.tagquery;
  const updateTags = {
    tags: tags
  };

  MediaProject.findByIdAndUpdate(id, { $set: updateTags }, function(err, result) {
    if(err){
      console.log(err);
    }
    console.log("RESULT: " + result);
    res.send('Done')
  });
})

router.post('/getDayWithDB', function(req, res) {

  let returnObj = {};
  
  MediaProject.find({ dayDir: req.body.dayDir })
    .exec(function(err, existingMedia) {
      
      if (err) { return next(err); }
      
      console.log(existingMedia);
      console.log(JSON.stringify(existingMedia));
          
      returnObj.status = 'ok';
      returnObj.mediaInfo = existingMedia;
      res.writeHead(200, {"Content-Type": "application/json"});
      // res.end(JSON.stringify(existingVideoSessions));
      res.end(JSON.stringify(returnObj));
    });
})

// this and addlink share the DB save code.. should refactor
router.post('/fileupload', uploadFile, function(req, res, next) {
  
  // are we using a database too?
  const theTags = JSON.parse(req.body.tags);
  const todayDir = utils.todayDir();
  
  if (ssconfig.USING_DB) {
    console.log('save to db...');

    const newMedia = new MediaProject({
      projectName: req.body.projectName,
      originalname: req.file.originalname,
      fileName: req.file.filename,
      size: req.file.size,
      path: req.file.path,
      dayDir: todayDir,
      tags: [
        'night',
        'dylan',
        'cat'
      ]
    })
  
    newMedia.save(function(err, theVP) {
      if (err) {
        next(err);
      } else {

        const status = {
          stat: "ok"
        };
      }
    });
  }

  console.log(theTags);
  console.log(theTags[1]);
  res.json({
    status: "ok"
  });
})


router.get('/')


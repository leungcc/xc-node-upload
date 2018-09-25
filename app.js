var fs = require('fs');
var path = require('path');
var express = require('express');
var multipart = require('connect-multiparty');
var app = express();

//app.use()
app.post('/upload', multipart({ uploadDir: './files' }), function(req, res) {
  // console.log(req.files.file.path)
  
  let newName = path.join('./files', req.body.identifier+'-'+req.body.chunkNumber);
  let finalName = path.join('./files', req.body.filename);
  console.log(req.files.file.path);
  fs.stat(req.files.file.path, (err, stat) => {
    fs.renameSync(req.files.file.path, newName);
  })

  if(req.body.totalChunks === req.body.chunkNumber) {
    mergeFile(finalName, path.join('./files', req.body.identifier));
  }

  res.json({code: 200, message: '上传成功'});
})

console.warn('xc-node-upload server run..');

app.listen(3000);

/**
 * @desc 合并文件
 * @param {String} destPath 目标文件名字
 * @param {String} chunkName 分块的名字（不包含-分块No）
 * @param {String} splitChar 分隔符
 * @param {Number} index 当前分块No
 */
function mergeFile(destPath, chunkName, splitChar='-', index=1) {

  let curpath = chunkName + splitChar + index;
  fs.stat(curpath, function(err, stat) {
    if(err) {
      console.log('loop stop.. index='+index);
      deleteTempFiles(chunkName, splitChar, 1);
    } else {
      fs.appendFileSync(destPath, fs.readFileSync(curpath));
      console.warn('merge...'+curpath);
      mergeFile(destPath, chunkName, '-', index+=1);
    }
  })
}

/**
 * @desc 删除临时文件
 */
function deleteTempFiles(chunkName, splitChar, index=1) {

  let curpath = chunkName + splitChar + index;
  fs.stat(curpath, (err, stat) => {
    if(err) {
      console.error(err);
    } else {
      console.log('deleteTempFile ..'+curpath)
      fs.unlinkSync(curpath);
      deleteTempFiles(chunkName, splitChar, index+=1);
    }
  })
}

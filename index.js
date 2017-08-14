var find = require('find');
var path = require('path');
var fs = require('fs');
var youtubedl = require('youtube-dl');
var execFile = require('child_process').execFile;

var YOUTUBE_URL = 'https://www.youtube.com/watch?v=6D7owsKQOKE';
var MUSIC_NAME = 'top_25_country_songs';

console.log('Starting directory: ' + process.cwd());

try {
  process.chdir('C:\\cygwin64\\home\\varo\\ytdl\\relax');
  console.log('New directory: ' + process.cwd());
}
catch (err) {
  console.error('chdir: ' + err);
  throw error;
}

var video = youtubedl(
  YOUTUBE_URL,
  [],
  {
    cwd: process.cwd()
  }
);

video.on('info', function(info) {
  console.log('Download started');
  console.log('filename: ' + info.filename);
  console.log('size: ' + info.size);
});

var stream = video.pipe(fs.createWriteStream(MUSIC_NAME + '.mp4'));

stream.on('finish', function () {
  console.log('youtube-dl finished. Extracting audio...');

  var child = execFile('ffmpeg.exe', [
      '-i', MUSIC_NAME + '.mp4',
      '-acodec', 'pcm_s16le',
      '-ac', '2',
      MUSIC_NAME + '.wav'
    ], {
      maxBuffer: 1024 * 1024 * 100
    }, function (error, stdout, stderr) {
      if (error) {
        console.error('stderr', stderr);
        throw error;
      }

      console.log('ffmpeg finished. Deleting original YouTube video...');

      stream.end();
      fs.unlinkSync(MUSIC_NAME + '.mp4');

      console.log('Original video deleted. Converting wav to mp3...');

      var child = execFile('lame.exe', [
          '--preset', 'extreme',
          MUSIC_NAME + '.wav',
          MUSIC_NAME + '.mp3',
        ], {
          maxBuffer: 1024 * 1024 * 100
        }, function (error, stdout, stderr) {
          if (error) {
            console.error('stderr', stderr);
            throw error;
          }

          console.log('lame finished. Deleting wav audio file...');
          fs.unlinkSync(MUSIC_NAME + '.wav');
          console.log('Wav audio file deleted. Exiting...');
        }
      );
    }
  );
});

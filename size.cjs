const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const file = path.join(__dirname, 'dist', 'widget.js');
const buf = fs.readFileSync(file);
zlib.gzip(buf, (err, result) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(result.length + ' bytes gzipped');
});

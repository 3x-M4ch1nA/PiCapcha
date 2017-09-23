#!/usr/bin/node

let https = require('https');
let _ = require('underscore');

// range for the first and last digits to read
let FIRST_ODD_DIGIT = parseInt(process.argv[process.argv.length - 2]) || 1;
let LAST_ODD_DIGIT = parseInt(process.argv[process.argv.length - 1]) || 10000;

// request object (data hosted by mit)
// needs seperate init to expose req to be later aborted
let req = https.request({
  host: 'stuff.mit.edu',
  path: '/afs/sipb/contrib/pi/pi-billion.txt',
});

// handle error and response
req.on('response', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    // get all of the odds in the chunk
    let chunkOdds = _.filter('' + chunk, (c) => parseInt(c) % 2 === 1).join('');

    // abort request if we have all needed data
    if (data.length + chunkOdds.length > LAST_ODD_DIGIT) {
      data += chunkOdds.slice(0, LAST_ODD_DIGIT - data.length);
      data = data.slice(FIRST_ODD_DIGIT - 1);
      req.abort();
    } else {
      data += chunkOdds;
    }
  });

  // add together all of the digits in data
  res.on('end', () => _.chain(data)
    .map((c) => parseInt(c))
    .filter((d) => d % 2 === 1)
    .reduce((memo, d) => memo + d, 0)
    .tap((answer) => console.log(answer))
  );
}).on('error', (e) => console.log(e)).end();

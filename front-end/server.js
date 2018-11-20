const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser'); 
const querystring = require('querystring');  
const router = express.Router();
const exec = require('child_process').exec;

const app = express();
app.use('/', router);
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());
app.use('/public', express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/public/static'));
app.use('/images', express.static(__dirname + '/public/images'));

const port = 8080;

const beginBuild = (req, res) => {
  // start sending output to client
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.write('<html>');
  res.write('<body>');
  res.write('<h1>Building site...</h1>');
  // get params
  const STITCH_ID = req.query.stitch_id;
  const NAMESPACE = req.query.namespace;
  const PREFIX = req.query.prefix;
  if (!STITCH_ID || !NAMESPACE || !PREFIX) {
    res.write('<p>Error with query params</p></body></html>');
    res.end();
    return;
  }
  // set env variables
  const env = Object.assign({}, process.env);
  env['STITCH_ID'] = STITCH_ID;
  env['NAMESPACE'] = NAMESPACE;
  env['PREFIX'] = PREFIX;
  // kick off build
  const gatsbyBuild = exec('gatsby build --prefix-paths', { env: env }, (err, stdout, stderr) => {
    if (err) {
      console.log('ERROR: problem with kicking off build using Gatsby', err);
    }
  });
  // get console data as build is running
  gatsbyBuild.stdout.on('data', (data) => {
    console.log(data); 
    res.write('<p style="margin:0;font-size:13px;">' + data + '</p>');
  });
  // when build is finished
  // TODO: upload files to aws
  gatsbyBuild.on('exit', function() {
    res.write('<p style="margin:0;font-size:13px;font-size:25px;font-weight:bold;">View your site at: https://snooty.docs.staging.mongodb.sh/index.html</p>');
    res.write('</body>');
    res.write('</html>');
    res.end();
  });
};

// https://github.com/gatsbyjs/gatsby/issues/3485
router.get('/build', (req, res) => { 
  // pre-build config
  console.log('running makefile to get docs-tools');
  exec('make static', (err, stdout, stderr) => {
    beginBuild(req, res);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

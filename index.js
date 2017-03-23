const http = require('http');
const fs = require('fs');
const url = require('url');
const graph = require('fbgraph');
const mkdirp = require('mkdirp');
const path = require('path');

const fbImageUrlRegEx = /https:\/\/www.facebook.com\/.*\/([0-9]*)\//;

const targetDirName = process.argv[2] || 'out';
const inputDirName = process.argv[3] || 'download.txt';

const TARGET_DIR = path.resolve(__dirname, targetDirName);

if (!process.env.FB_TOKEN) {
  console.error('No FB Access Token');
}


graph.setAccessToken(process.env.FB_TOKEN);
mkdirp.sync(TARGET_DIR);

const pictures = fs.readFileSync(path.resolve(__dirname, inputDirName), 'utf8');

const graphRequests = pictures
  .split('\n')
  .map(url => url.match(fbImageUrlRegEx)[1] || '')
  .filter(id => id.length !== 0)
  .map(id => {
    return {
      method: 'GET',
      relative_url: `${id}?fields=images`
    }
  });

console.log('Contact FB Graph');
fbGraphBatchRequest(graphRequests)
  .then(results => {
    console.log('Process Results');
    return results
      .map(result => result.images)
      .map(images => {
        return images
          .reduce((a, b) => {
            if (a.width > b.width) {
              return a;
            } else {
              return b;
            }
          }, { width: 0 });
      })
      .map(img => img.source)
      .map(imgSrc => imgSrc.replace(/^https/, 'http'));
  })
  .then(imageSources => downloadFiles(imageSources))
  .then(imageNames => {
    console.log(`Done! Downloaded ${imageNames.length} pictures`);
  })
  .catch(err => console.error(err));

function fbGraphBatchRequest(batch) {
  return new Promise((resolve, reject) => {
    graph.batch(batch, (err, res) => {
      if (err) {
        return reject(err);
      }

      const result = res
        .filter(val => val.code === 200)
        .map(val => JSON.parse(val.body));

      resolve(result);
    });
  });
}

function downloadFiles(fileSources) {
  const requests = fileSources
    .map(source => {
      const fileName = path.basename(url.parse(source).pathname);
      return { source, fileName };
    })
    .map(({ source, fileName }) => download(source, fileName))
  return Promise.all(requests);
}

function download(source, targetName) {
  return new Promise((resolve, reject) => {
    const targetPath = path.join(TARGET_DIR, targetName);
    const file = fs.createWriteStream(targetPath);
    const request = http.get(source, response => {
      response.pipe(file);
      file.on('finish', () => {
        resolve(targetPath);
      });
      file.on('error', err => {
        reject(err);
      });
    });
    request.on('error', err => {
      reject(err);
    });
  });
}

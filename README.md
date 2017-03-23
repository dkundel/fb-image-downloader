# fb-image-downloader
Downloads a batch of images from Facebook given a list of their FB Urls

## Instructions

### 1. Clone and setup project

```bash
git clone https://github.com/dkundel/fb-image-downloader.git
cd fb-image-downloader
yarn # or npm install
```

### 2. Create a file (e.g. `download.txt`) with all the Facebook Image Urls on single lines. Example:

```text
https://www.facebook.com/TeamTwilio/photos/a.469738127758.246095.39535177758/10154477881737759/?type=3&theater
https://www.facebook.com/TeamTwilio/photos/a.469738127758.246095.39535177758/10154230523777759/?type=3&theater
```

### 3. Get an Access Token for the FB Graph API.

You can get one here: https://developers.facebook.com/tools/explorer/

### 4. Run the Script:

```bash
FB_TOKEN=youraccesstoken node index.js out download.txt
```

### 5. Check out the `out` folder for the pictures :) 

# Contributors

- Dominik Kundel <dominik.kundel@gmail.com>

# License

MIT
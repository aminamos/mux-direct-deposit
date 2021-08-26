require('dotenv').config()
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const Mux = require('@mux/mux-node');
const pkg = require('../package.json');

const { Video } = new Mux();

const myAxios = axios.create({
  headers: {
    'User-Agent': `Mux Node | ${pkg.version}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  mode: 'cors',
  withCredentials: false,
  auth: {
    username: process.env.NEW_MUX_TOKEN_ID,
    password: process.env.NEW_MUX_TOKEN_SECRET
  },
});

async function checkMasterAccess(assetItem) {
  if (assetItem.master_access === 'none') {
    await Video.Assets.updateMasterAccess(assetItem.id, {
      master_access: 'temporary',
    });
    console.log('updated access, moving on...');
  } else if (
    assetItem.master_access === 'temporary' &&
    assetItem.master.status === 'ready'
  ) {
    console.log('skipped, master access already ready and available');
  } else if (
    assetItem.master_access === 'temporary' &&
    assetItem.master.status !== 'ready'
  ) {
    console.log('master access on, but asset is not ready');
    console.log(assetItem);
  } else if (assetItem.master_access === 'none') {
    Video.Assets.updateMasterAccess(assetItem.id, {
      master_access: 'temporary',
    });
    console.log('master access updated');
  } else {
    console.log('something is wrong');
    console.log(assetItem);
  }
}

function uploadVideosToOtherEnvironment(assetItem) {
  myAxios.post('https://api.mux.com/video/v1/assets', {
    input: assetItem.master.url,
    playback_policy: 'public',
  });
}

async function turnMasterAccessOffForAllAssets(assetItem) {
  switch (assetItem.master_access) {
    case 'temporary':
      Video.Assets.updateMasterAccess(assetItem.id, { master_access: 'none' });
      console.log("master access removed")
      break;
    case 'none':
      console.log('skipping, correct status already set');
      break;
    default:
      console.log('no matches, which is a problem');
  }
}

app.get('/', (req, res) => {
  console.log('This route intentionally left blank.')
  res.send('\n');
});

app.get('/add-master-to-source', (req, res) => {
  async function addMasterAccessToSourceEnvironmentAssets() {
    try {
      const firstVideoListArray = await Video.Assets.list();
  
      /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
  
      for (let i = 0; i < firstVideoListArray.length; i++) {
        (function () {
          const j = i;
          setTimeout(() => {
            checkMasterAccess(firstVideoListArray[i]);
          }, j * 2500);
        })();
      }
    } catch (error) {
      console.error(error);
    }
  }
  addMasterAccessToSourceEnvironmentAssets();
  res.send('\n');
});

app.get('/upload-assets-to-destination', (req, res) => {
  async function uploadVideosToDestination() {
    try {
      const secondVideoListArray = await Video.Assets.list();
  
      /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
  
      for (let i = 0; i < secondVideoListArray.length; i++) {
        (function () {
          const j = i;
          setTimeout(() => {
            uploadVideosToOtherEnvironment(
              secondVideoListArray[i],
            );
          }, j * 2500);
        })();
      }
    } catch (error) {
      console.error(error);
    }
  }
  uploadVideosToDestination();
  res.send('\n');
});

app.get('/remove-master-from-source', (req, res) => {
  async function removeMasterFromSource() {
    const assetsForMasterRemoval = await Video.Assets.list()

    /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */

    for (let i = 0; i < assetsForMasterRemoval.length; i++) {
      (function () {
        const j = i;
        setTimeout(() => {
          turnMasterAccessOffForAllAssets(assetsForMasterRemoval[i]);
        }, j * 2500);
      })();
    }
  }
  removeMasterFromSource()
  res.send('\n');
});

app.listen(port, () => {
  console.log(`Server active`);
});

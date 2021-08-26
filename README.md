# Direct Deposit
Add master access to all assets, move assets from one environment to another.

## Definitions
"Source environment" is the environment that contains assets that need to be moved.

"Destination environment" is the environment that will hold the assets after the transfer is complete.

This will not delete assets in the source environment. There's a 2.5 second delay between each request, which is a bit above the required rate limit. At this rate, 500 requests would take about 20 minutes.

## Configuration
First, set environment variables

Source environment's access token: MUX_TOKEN_ID=

Source environment's secret token: MUX_TOKEN_SECRET=

Destination environment's access token: NEW_MUX_TOKEN_ID=

Destination environment's secret token: NEW_MUX_TOKEN_SECRET=

Then, run `yarn install`

## Usage
Clone repository

Navigate to repository directory

Run `node src/index.js` in terminal

Open a new terminal window

Run `curl localhost:3000` to add master access for all assets

(TODO - add this function & endpoint) Run `curl localhost:3000/check-master-status` to confirm which assets do, or do not, have a `master_access` status of `ready`

Run `curl localhost:3000/uploadall` to move assets from the source environment to the destination environment

Run `curl localhost:3000/turn-off-master-all-assets` to remove master access for all assets in the source environment
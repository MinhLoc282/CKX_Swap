// src/node/index.js
import fetch from 'isomorphic-fetch';
import { HttpAgent } from '@dfinity/agent';
import { createRequire } from 'node:module';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Principal } from '@dfinity/principal';
import { canisterId, createActor } from '../declarations/borrow/index.js';
import { identity } from './identity.js';

const uri = 'mongodb+srv://devckx:8e1PWJamFy8iM3o3@cluster0.8uitpxr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Require syntax is needed for JSON file imports
const require = createRequire(import.meta.url);
const isDev = process.env.DFX_NETWORK !== 'ic';
let localCanisterIds;
if (isDev) {
  localCanisterIds = require('../../.dfx/local/canister_ids.json');
} else {
  localCanisterIds = require('../../canister_ids.json');
}

// Use `process.env` if available provoded, or fall back to local
const effectiveCanisterId = canisterId?.toString()
?? (isDev ? localCanisterIds.borrow.local : localCanisterIds.borrow.ic);
// const effectiveCanisterId = 'be2us-64aaa-aaaaa-qaabq-cai';

const agent = new HttpAgent({
  identity,
  host: 'http://127.0.0.1:4943',
  fetch,
});

const actor = createActor(effectiveCanisterId, {
  agent,
});

async function main() {
  setInterval(async () => {
    const len = await getLength();
    if (len >= 1) {
      const currentLoanId = Number(await actor.getloanId());
      const lastUser = await collection.findOne({}, { sort: { _id: -1 } });
      if (lastUser.id < currentLoanId) {
        let i = lastUser.id;
        console.log('lastUser_id: ', lastUser.id);
        while (i <= currentLoanId) {
          const newLoan = await actor.getLoanDetail(i);
          console.log('First if: ', newLoan[0]);
          await insertUser(Number(newLoan[0].id), (newLoan[0].borrower).toText());
          i += 1;
        }
      } else {
        // console.log('result: ', result);
        const cursor = collection.find();

        // Array to store borrower values
        const borrowerList = [];

        // Iterate over the cursor and extract borrower values
        await cursor.forEach((document) => {
          borrowerList.push(Principal.fromText(document.borrower));
        });
        // console.log('borrower: ', borrowerList);
        try {
          const result = await actor.checkRemoveLP(borrowerList);
          console.log('result: ', result);
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      const currentLoanId = await actor.getloanId();
      if (currentLoanId != 0) {
        let i = 1;
        while (i <= currentLoanId) {
          const newLoan = await actor.getLoanDetail(i);
          // console.log('Else stmt: ', newLoan[0]);
          await insertUser(Number(newLoan[0].id), (newLoan[0].borrower).toText());
          i += 1;
        }
      }
    }
    // const update = await actor.updateA();
    // const mintResult1 = await actor.valueA();
    // const mintResult = await actor.user();
  }, [15000]);
}

main();

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
  // try {
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  console.log('Pinged your deployment. You successfully connected to MongoDB!');
  // }
  // finally {
  //   await client.close();
  // }
  // await insertUser(1, 'galp6-l6fyt-3rdyq-eajdm-pwuew-xh4si-ilw4w-w2vx6-awj5c-dlek6-aae');
  // await getAllUser();
  getLength();
}
run().catch(console.dir);

const db = client.db('ICP');
const collection = db.collection('CKX');

const insertUser = (userId, borrower) => {
  const document = { id: userId, borrower };
  collection.insertOne(document, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Insert ${document.borrower}`);
    }
  });
};

const getAllUser = async () => {
  const cursor = collection.find();
  // Iterate over the cursor and log each document
  await cursor.forEach((document) => {
    console.log(document);
  });
};

const getLength = async () => {
  const count = await collection.countDocuments();

  console.log('Number of users in the collection:', count);
  return count;
};

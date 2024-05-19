// src/node/index.js
import fetch from 'isomorphic-fetch';
import { HttpAgent } from '@dfinity/agent';
import { createRequire } from 'node:module';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Principal } from '@dfinity/principal';
import { canisterId, createActor } from '../declarations/borrow/index.js';
import { identity } from './identity.js';

const uri = 'mongodb+srv://minhloc2802:Saikikusuo333@cluster0.budz48r.mongodb.net/';

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
          if (!newLoan[0].isRepaid) {
            console.log('First if: ', newLoan[0]);
            await insertUser(
              Number(newLoan[0].id),
              (newLoan[0].borrower).toText(),
              newLoan[0].tokenIdBorrow,
              newLoan[0].isRepaid,
            );
          } else {
            // Update MongoDB record to mark loan as repaid
            await updateLoanStatus(Number(newLoan[0].id), true);
          }
          i += 1;
        }
      } else {
        // Remove existing records with isRepaid set to true
        let i = lastUser.id;
        while (i <= currentLoanId) {
          const newLoan = await actor.getLoanDetail(i);
          if (!newLoan[0].isRepaid) {
            console.log('First if: ', newLoan[0]);
            await insertUser(
              Number(newLoan[0].id),
              (newLoan[0].borrower).toText(),
              newLoan[0].tokenIdBorrow,
              newLoan[0].isRepaid,
            );
          } else {
            // Update MongoDB record to mark loan as repaid
            await updateLoanStatus(Number(newLoan[0].id), true);
          }
          i += 1;
        }

        await removeRepaidRecords();

        // Fetch borrower principals for non-repaid loans
        const borrowerList = await getNonRepaidBorrowers();

        try {
          const result = await actor.checkRemoveLP(borrowerList);
          console.log('result: ', result);
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      const currentLoanId = await actor.getloanId();
      if (currentLoanId !== 0) {
        let i = 1;
        while (i <= currentLoanId) {
          const newLoan = await actor.getLoanDetail(i);
          if (!newLoan[0].isRepaid) {
            console.log('Else stmt: ', newLoan[0]);
            await insertUser(
              Number(newLoan[0].id),
              (newLoan[0].borrower).toText(),
              newLoan[0].tokenIdBorrow.toText(),
              newLoan[0].isRepaid,
            );
          } else {
            // Update MongoDB record to mark loan as repaid
            await updateLoanStatus(Number(newLoan[0].id), true);
          }
          i += 1;
        }
      }
    }
  }, [10000]);
}

main();

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  console.log('Pinged your deployment. You successfully connected to MongoDB!');
  getLength();
}
run().catch(console.dir);

const db = client.db('ICP');
const collection = db.collection('CKX');

const insertUser = (userId, borrower, tokenIdBorrow, isRepaid) => {
  const document = {
    id: userId, borrower, tokenIdBorrow, isRepaid,
  };
  collection.insertOne(document, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Insert ${document.borrower}`);
    }
  });
};

async function updateLoanStatus(loanId, isRepaidVa) {
  await collection.updateOne({ id: loanId }, { $set: { isRepaid: isRepaidVa } });
}

const getAllUser = async () => {
  const cursor = collection.find();
  await cursor.forEach((document) => {
    console.log(document);
  });
};

const getLength = async () => {
  const count = await collection.countDocuments();
  console.log('Number of users in the collection:', count);
  return count;
};

const removeRepaidRecords = async () => {
  const result = await collection.deleteMany({ isRepaid: true });
  console.log(`Removed ${result.deletedCount} repaid records`);
};

const getNonRepaidBorrowers = async () => {
  const cursor = collection.find({ isRepaid: false }, { borrower: 1, _id: 0 });
  const borrowerList = [];
  await cursor.forEach((document) => {
    borrowerList.push(Principal.fromText(document.borrower));
  });
  return borrowerList;
};

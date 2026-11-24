import {test} from 'node:test';
import assert from 'node:assert/strict';
import {migrateCatches,personalRecords,exportCatches} from '../src/journal.js';
const old={speciesIndex:0,name:'Trucha arcoíris',weight:1.25,length:44,date:'2026-11-23T18:00:00.000Z'};
test('old captures survive migration without inventing a lure or dropping history',()=>{
  const data=migrateCatches(Array.from({length:1002},()=>({...old})));
  assert.equal(data.length,1002);assert.equal(data[0].weight,1.25);assert.equal(data[0].lureId,null);
  assert.deepEqual(migrateCatches(data),data);assert.equal(migrateCatches([null,{},old]).length,1);
});
test('records use greatest weight per species, and CSV includes the actual lure',()=>{
  const catches=migrateCatches([old,{...old,weight:2,lureId:'spinner'},{...old,name:'Carpa común',lureId:'worm',weight:5}]);
  const records=personalRecords(catches);assert.equal(records.size,2);assert.equal(records.get(old.name).weight,2);
  assert.ok(exportCatches(catches).includes('Cucharilla'));assert.ok(exportCatches(catches).includes('Lombriz'));
});

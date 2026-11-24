import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Group,SkinnedMesh,BufferGeometry,MeshStandardMaterial} from 'three';
import {FirstPersonHands} from '../src/visuals/hands.js';
test('unavailable experimental hands stay disabled and reject unvalidated/static placeholders',()=>{
  const camera=new Group(),rig={gripSocket:new Group(),crankSocket:new Group(),reelRate:0},hands=new FirstPersonHands(camera,rig);
  assert.equal(hands.available,false);assert.equal(hands.setEnabled(true),false);assert.equal(hands.root.visible,false);
  assert.equal(hands.mount({model:new Group(),driver:{update(){}},source:'test',license:'CC0-1.0',visuallyValidated:true}),false);
  hands.update(1,{state:'casting'});assert.equal(hands.enabled,false);
});
test('reviewed asset adapter can be toggled independently and receives reusable pose/grip context',()=>{
  // Empty skinned fixture tests the adapter contract, not a human model or its visual quality.
  const camera=new Group(),rig={gripSocket:new Group(),crankSocket:new Group(),reelRate:1},hands=new FirstPersonHands(camera,rig),model=new SkinnedMesh(new BufferGeometry(),new MeshStandardMaterial());
  let updates=0,disposed=false;const driver={update(c){updates++;assert.equal(c.rightGrip,rig.gripSocket);assert.equal(c.reelRate,1);},dispose(){disposed=true;}};
  assert.equal(hands.mount({model,driver,source:'local-test-fixture',license:'CC0-1.0'}),false);
  assert.equal(hands.mount({model,driver,source:'local-test-fixture',license:'CC0-1.0',visuallyValidated:true}),true);assert.equal(hands.enabled,false);
  hands.setEnabled(true);const game=Object.freeze({state:'fighting',tension:.5,power:.6,castTime:0});hands.update(.1,game);assert.equal(updates,1);
  hands.setEnabled(false);hands.update(.1,game);assert.equal(updates,1);hands.unmount();assert.equal(hands.available,false);assert.equal(disposed,true);
});

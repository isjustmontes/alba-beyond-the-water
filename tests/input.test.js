import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FishingActions} from '../src/input/actions.js';
import {shouldUseTouch} from '../src/input/touch-mode.js';
import {FishingGame} from '../src/fishing.js';
test('desktop, phone, tablet and hybrid input modes are capability-driven',()=>{
  assert.equal(shouldUseTouch({width:390}),false,'narrow desktop remains desktop');
  assert.equal(shouldUseTouch({coarse:true,hover:false,anyFine:false,anyHover:false,touchPoints:5,width:390}),true);
  assert.equal(shouldUseTouch({coarse:true,hover:false,anyFine:false,anyHover:false,touchPoints:5,width:1366}),true,'landscape tablet');
  const hybrid={coarse:false,hover:true,anyFine:true,anyHover:true,touchPoints:10,width:1100};
  assert.equal(shouldUseTouch(hybrid),false);assert.equal(shouldUseTouch({...hybrid,lastInput:'touch'}),true);
  assert.equal(shouldUseTouch({...hybrid,lastInput:'mouse'}),false);assert.equal(shouldUseTouch({...hybrid,lastInput:'keyboard'}),false);
});
test('duplicate pointer/key holds and synthetic lost-capture releases cast only once',()=>{
  const game=new FishingGame(),actions=new FishingActions(game);
  actions.hold('pointer:1');actions.hold('pointer:1');actions.hold('space');game.update(.3);
  actions.release('pointer:1');assert.equal(game.state,'charging');actions.release('space');actions.release('pointer:1');
  assert.equal(game.actionCounts.casts,1);assert.equal(game.state,'casting');
});
test('cancel, focus loss and modal blocking clear held actions without accidental casts',()=>{
  const game=new FishingGame();let blocked=false;const actions=new FishingActions(game,{isBlocked:()=>blocked});
  actions.hold('touch');actions.release('touch',{cancel:true});assert.equal(game.state,'ready');assert.equal(game.actionCounts.casts,0);
  actions.hold('space');actions.clear();assert.equal(game.state,'ready');assert.equal(actions.sources.size,0);
  blocked=true;actions.hold('touch');assert.equal(game.state,'ready');
});

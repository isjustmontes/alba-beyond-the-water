import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Exploration} from '../src/input/exploration.js';
import {SHORE_PATH,FISHING_SPOTS,walkHeight,shoreHeight,shoreWidth,shoreCenter,atSpot} from '../src/input/shore-route.js';
import {shoreGeometry,terrainHeight} from '../src/visuals/landscape.js';
import {FishingGame} from '../src/fishing.js';

test('walk from dock to existing mainland through both new posts and return at different frame rates',()=>{
  for(const fps of [20,60,120]){
    const m=new Exploration();m.toggle('ready',0,0);m.keys.add('KeyW');
    const route=[...SHORE_PATH,...SHORE_PATH.slice(0,-1).reverse(),[0,7]];
    for(const [x,z]of route){
      let steps=0;
      while(Math.hypot(m.x-x,m.z-z)>.06&&steps++<fps*20){
        const yaw=Math.atan2(-(x-m.x),-(z-m.z)),old=m.floor;
        m.update(1/fps,yaw);assert.notEqual(walkHeight(m.x,m.z),null);assert.ok(Math.abs(m.floor-old)<.10,'no vertical jump or cliff');
      }
      assert.ok(steps<fps*20,`route blocked at ${x},${z}`);m.clear();m.keys.add('KeyW');
    }
    assert.ok(Math.hypot(m.x,m.z-7)<.07);assert.equal(m.toggle('ready',0,0),null);
  }
});
test('land connects to the actual terrain, matches collision and excludes surrounding water',()=>{
  assert.ok(Math.abs(shoreHeight(6,76)-terrainHeight(6,76))<.03,'joins original mainland');
  assert.equal(walkHeight(12,8),null);assert.equal(walkHeight(0,0),null);assert.equal(walkHeight(0,100),null);
  for(const [x,z]of SHORE_PATH){assert.notEqual(walkHeight(x,z),null);if(z>14)assert.equal(walkHeight(x,z),shoreHeight(x,z));}
  const geo=shoreGeometry(),p=geo.attributes.position,n=geo.attributes.normal;
  assert.ok(p.count<6500);for(let i=0;i<p.count;i++){assert.ok(n.getY(i)>0);assert.ok(Math.abs(p.getY(i)-shoreHeight(p.getX(i),p.getZ(i)))<.0001);}
  geo.dispose();
});
test('posts preserve orientation, tackle guard and individual fishing origins',()=>{
  for(const spot of FISHING_SPOTS){
    const m=new Exploration();m.toggle('ready',0,0);m.x=spot.x;m.z=spot.z;
    assert.equal(atSpot(m.x,m.z),spot);
    assert.ok(m.toggle('ready',spot.yaw+1,0,()=>false));assert.equal(m.toggle('ready',spot.yaw,0),null);
    assert.equal(m.spot,spot);assert.ok(m.toggle('waiting',spot.yaw,0));
    const g=new FishingGame({random:()=>.5});assert.equal(g.setOrigin(spot.originX,spot.originZ),true);
    g.setAim(-Math.sin(spot.yaw),-Math.cos(spot.yaw));g.press();g.update(.25);g.release();
    assert.equal(g.setOrigin(0,4),false);assert.ok(Math.abs(g.lure.x-(spot.originX+g.aim.x*g.distance+g.windOffset.x))<1e-9);
    assert.ok(Math.abs(g.lure.z-(spot.originZ+g.aim.z*g.distance+g.windOffset.z))<1e-9);
    if(spot.id!=='dock')assert.ok(Math.abs(g.lure.x-shoreCenter(g.lure.z))>shoreWidth(g.lure.z)||g.lure.z<10,'cast lands off the bank');
    for(let i=0;i<70;i++)g.update(1/60);
    g.press();const before=g.distance;g.update(.2);assert.ok(g.distance<before);g.release();
  }
});
test('fight target is translated with the post without changing tension or capture rules',()=>{
  const games=[];
  for(const spot of FISHING_SPOTS){
    const g=new FishingGame({random:()=>.5});g.setOrigin(spot.originX,spot.originZ);
    g.state='bite';g.hookedId=0;const fish=g.school.fish[0];g.target={speciesIndex:fish.speciesIndex,weight:fish.weight,length:fish.length};g.distance=g.castDistance=18;
    fish.position.x=g.origin.x;fish.position.z=g.origin.z-18;g.press();g.updateFight(.2);games.push(g);
  }
  const a=games[0];for(const g of games){assert.equal(g.tension,a.tension);assert.equal(g.distance,a.distance);assert.equal(g.stamina,a.stamina);assert.ok(Math.abs((g.lure.x-g.origin.x)-(a.lure.x-a.origin.x))<1e-9);assert.ok(Math.abs((g.lure.z-g.origin.z)-(a.lure.z-a.origin.z))<1e-9);}
});

test('visible grass outside the former narrow trail is walkable with water and obstacle margins',()=>{
  for(const [x,z]of [[0,20],[-7,20],[-8,20],[4,25]])assert.equal(walkHeight(x,z),shoreHeight(x,z));
  assert.equal(walkHeight(4,25,[{x:4,z:25,radius:.5}]),null);
  assert.notEqual(walkHeight(4,25,[{x:4,z:25,radius:.5,index:1,mesh:{count:1}}]),null,'hidden instances cannot create invisible walls');
  for(let z=14;z<78;z+=.5)for(let x=-25;x<25;x+=.5){
    if(walkHeight(x,z)!==null){assert.ok(shoreHeight(x,z)>.35);assert.ok(Math.abs(x-shoreCenter(z))<shoreWidth(z));}
  }
});
test('shore zones accept nearby dry positions and lake-facing angles outside the old cone',()=>{
  for(const [x,yaw]of [[-7,-.2],[7,.2]]){
    const m=new Exploration();m.toggle('ready',0,0);m.x=x;m.z=20;
    assert.ok(atSpot(x,20));assert.ok(m.toggle('ready',yaw,0,()=>false));
    assert.equal(m.toggle('ready',yaw,0,()=>true),null);assert.equal(m.x,x);assert.equal(m.z,20);
  }
  assert.equal(atSpot(-12,14),null);
});
test('release validates the final aim and power, preserving tackle on blocked casts',()=>{
  const g=new FishingGame({random:()=>.5});let calls=0;
  g.canCast=()=>{calls++;return false;};g.press();g.update(.3);g.release();g.release();
  assert.equal(calls,1);assert.equal(g.state,'ready');assert.equal(g.actionCounts.casts,0);
  const yaw=-.2,x=-7,z=20;
  g.canCast=power=>{assert.ok(power>.08);g.setOrigin(x-3*Math.sin(yaw),z-3*Math.cos(yaw));return true;};
  g.onEvent=e=>{if(e.type==='cast')g.setAim(-Math.sin(yaw),-Math.cos(yaw));};
  g.press();g.update(.3);g.release();
  assert.equal(g.actionCounts.casts,1);
  assert.ok(Math.abs(g.lure.x-(x-Math.sin(yaw)*(g.distance+3)+g.windOffset.x))<1e-9);
  assert.ok(Math.abs(g.lure.z-(z-Math.cos(yaw)*(g.distance+3)+g.windOffset.z))<1e-9);
});

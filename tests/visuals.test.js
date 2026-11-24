import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lakeDepth,makeLakeBed} from '../src/visuals/water.js';
import {terrainGeometry,terrainHeight} from '../src/visuals/landscape.js';

test('near-dock water is shallower than offshore water and the lake bed stays submerged',()=>{
  assert.ok(lakeDepth(0,7)<lakeDepth(0,-35));
  const bed=makeLakeBed(),positions=bed.geometry.attributes.position;
  for(let i=0;i<positions.count;i++) {
    assert.ok(Number.isFinite(positions.getY(i)));
    assert.ok(positions.getY(i)<-.1,'exposed lake bed would hide the water');
  }
  bed.geometry.dispose();bed.material.dispose();
});
test('terrain faces upwards, has finite geometry, and meets the shoreline',()=>{
  const geo=terrainGeometry(64,24),positions=geo.attributes.position,normals=geo.attributes.normal;
  for(let i=0;i<positions.count;i++) {
    assert.ok(Number.isFinite(positions.getY(i)));
    assert.ok(normals.getY(i)>0,'reversed terrain winding breaks lighting and reflections');
  }
  assert.ok(Math.abs(terrainHeight(82,-42))<.2);
  assert.ok(terrainHeight(150,-80)>15);
  geo.dispose();
});

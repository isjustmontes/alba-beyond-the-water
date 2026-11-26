import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MeshStandardMaterial,ShaderLib,Texture} from 'three';
import {villageSurfaceTexel,villageSurfaceMaterial} from '../src/visuals/village-materials.js';

test('baked rural surfaces are reproducible, bounded and distinct without allocating a pixel per sample',()=>{
  const signatures=[];
  for(const kind of ['granite','trim','wood','tile']){
    const out={},values=[];
    for(let y=0;y<512;y+=31)for(let x=0;x<512;x+=29){
      assert.equal(villageSurfaceTexel(kind,x,y,out),out);
      assert.deepEqual(out,villageSurfaceTexel(kind,x,y));
      for(const c of Object.values(out))assert.ok(Number.isFinite(c)&&c>=0&&c<=255);
      values.push(out.r+out.g+out.b);
    }
    assert.ok(Math.max(...values)-Math.min(...values)>35,'surface must retain local variation');
    signatures.push(values.join(','));
  }
  assert.equal(new Set(signatures).size,4,'dressed stone, masonry, timber and clay cannot share the same surface');
  assert.ok(villageSurfaceTexel('tile',150,0).r<villageSurfaceTexel('tile',150,250).r,'overlap end is weathered');
});

test('material projection keeps bump and color aligned while preserving instancing and existing roof UVs',()=>{
  const keys=[];
  for(const kind of ['granite','trim','wood','tile']){
    const map=new Texture(),material=new MeshStandardMaterial({map,bumpMap:map}),original=material;
    assert.equal(villageSurfaceMaterial(material,kind),original);
    const shader={vertexShader:ShaderLib.standard.vertexShader,fragmentShader:ShaderLib.standard.fragmentShader};
    material.onBeforeCompile(shader);
    assert.equal(material.map,map);assert.equal(material.bumpMap,map);
    assert.ok(shader.vertexShader.includes('instanceMatrix*albaPosition'));
    assert.ok(shader.fragmentShader.includes('albaDamp'));
    if(kind==='tile')assert.ok(shader.fragmentShader.includes('#include <map_fragment>'));
    else{
      assert.ok(shader.fragmentShader.includes('texture2D( map, albaVillageUv() )'));
      assert.ok(shader.fragmentShader.includes('dFdx( albaVillageUv() )'));
      assert.ok(!shader.fragmentShader.includes('#include <bumpmap_pars_fragment>'));
    }
    keys.push(material.customProgramCacheKey());map.dispose();material.dispose();
  }
  assert.equal(new Set(keys).size,4,'renderer programs cannot reuse another surface projection');
});

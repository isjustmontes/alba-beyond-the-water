import * as THREE from 'three';
export class FishingEffects {
  constructor(scene,random=Math.random,ripples=null) {
    this.random=random;this.cursor=0;this.capacity=48;this.active=false;
    this.particles=Array.from({length:this.capacity},()=>({age:1,life:.6,x:0,y:0,z:0,vx:0,vy:0,vz:0,size:0}));
    this.mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(1,5,4),new THREE.MeshStandardMaterial({color:0xc6e1d7,roughness:.16,metalness:.12,transparent:true,opacity:.72,depthWrite:false}),this.capacity);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.mesh.frustumCulled=false;this.mesh.visible=false;this.mesh.renderOrder=3;
    this.dummy=new THREE.Object3D();scene.add(this.mesh);this.high=true;
    this.time=0;this.ripples=ripples;this.rippleCursor=0;this.rippleCount=0;
  }
  ripple(position,strength=.3){
    if(!this.ripples)return;
    this.ripples[this.rippleCursor++%this.ripples.length].set(position.x,position.z,this.time,strength);this.rippleCount++;
  }
  emit(position,strength=1) {
    this.ripple(position,strength);
    this.active=true;
    const count=this.high ? 15 : 8;
    for(let i=0;i<count;i++) {
      const p=this.particles[this.cursor++%this.capacity],angle=this.random()*Math.PI*2,speed=(.3+this.random()*1.3)*strength;
      Object.assign(p,{age:0,life:.4+this.random()*.3,x:position.x,y:.05,z:position.z,vx:Math.cos(angle)*speed,vz:Math.sin(angle)*speed,vy:(.8+this.random()*1.5)*Math.sqrt(strength),size:(.015+this.random()*.025)*Math.sqrt(strength)});
    }
  }
  update(dt) {
    this.time+=dt;
    if(!this.active)return;
    let alive=false;
    for(let i=0;i<this.capacity;i++) {
      const p=this.particles[i];p.age+=dt;
      const visible=p.age<p.life;
      if(visible){alive=true;p.vy-=dt*9.8;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.y<-.03)p.age=p.life;}
      this.dummy.position.set(p.x,p.y,p.z);this.dummy.scale.setScalar(visible ? p.size*(1-p.age/p.life) : 0);this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);
    }
    this.active=alive;this.mesh.visible=alive;if(alive)this.mesh.instanceMatrix.needsUpdate=true;
  }
}

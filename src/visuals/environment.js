import * as THREE from 'three';
import {atmosphere} from './atmosphere.js';

export function makeEnvironmentSky(sun) {
  const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
    uniforms:{sun:{value:sun},daylight:{value:1},cloudCover:{value:.12},rainAmount:{value:0},skyTime:{value:0},wind:{value:new THREE.Vector2(1,0)}},
    vertexShader:'varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec3 vWorld;uniform vec3 sun;uniform float daylight,cloudCover,rainAmount,skyTime;uniform vec2 wind;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
    float clouds(vec2 p){float n=0.,a=.55;for(int i=0;i<4;i++){n+=noise(p)*a;p=p*2.04+3.7;a*=.48;}return n;}
    void main(){vec3 d=normalize(vWorld);float h=max(0.,d.y),warm=1.-smoothstep(.05,.65,abs(sun.y));
      vec3 horizon=mix(vec3(.63,.76,.81),vec3(1.,.64,.35),warm);
      vec3 day=mix(horizon,vec3(.15,.34,.54),pow(h,.48));
      day=mix(day,vec3(.32,.39,.43),cloudCover*.58+rainAmount*.15);
      vec3 col=mix(mix(vec3(.055,.08,.12),vec3(.012,.028,.065),h),day,daylight);
      float cover=smoothstep(.78-cloudCover*.65,.98-cloudCover*.52,clouds(d.xz/max(.13,d.y+.16)*3.+wind*skyTime*.0018));
      cover*=smoothstep(.0,.18,h);
      col=mix(col,mix(vec3(.075,.09,.12),vec3(.80,.82,.79),daylight)*(1.-rainAmount*.3),cover*.8);
      float glow=pow(max(0.,dot(d,sun)),32.);col+=vec3(.50,.23,.07)*glow*daylight*(1.-cloudCover*.8);
      float disk=smoothstep(.99984,.99993,dot(d,sun));col=mix(col,vec3(3.5,2.6,1.35),disk*(1.-cloudCover*.85));
      float stars=step(.998,hash(floor(d.xz/max(.1,h)*420.)))*smoothstep(.1,.35,h);
      col+=stars*(1.-daylight)*(1.-cover)*.7;
      float moon=smoothstep(.99965,.99985,dot(d,-sun));col+=vec3(.52,.62,.78)*moon*(1.-daylight)*(1.-cover);
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`});
  const sky=new THREE.Mesh(new THREE.SphereGeometry(600,40,24),material);sky.frustumCulled=false;return sky;
}

// One draw call, analytic falling streaks. No particle objects or CPU particle updates.
export class EnvironmentalView {
  constructor(world){
    this.world=world;this.color=new THREE.Color();this.waterColor=new THREE.Color();this.atmosphere={};this.lastShadow=-Infinity;this.lastHour=-1;
    this.moon=new THREE.DirectionalLight(0x93afe0,.18);world.scene.add(this.moon);
    const count=420,data=new Float32Array(count*6),ends=new Float32Array(count*2);
    for(let i=0;i<count;i++){const x=world.random()*36-18,y=world.random()*18,z=world.random()*42-30;data.set([x,y,z,x,y,z],i*6);ends[i*2+1]=1;}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(data,3));geometry.setAttribute('end',new THREE.BufferAttribute(ends,1));
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
      uniforms:{time:{value:0},rain:{value:0},wind:{value:new THREE.Vector2()},eye:{value:world.camera.position}},
      vertexShader:`uniform float time;uniform vec2 wind;uniform vec3 eye;attribute float end;varying float fade;
        void main(){vec3 p=position;p.y=mod(p.y-time*9.,18.)+end*.20;p.xz+=wind*(18.-p.y)*.09;p.xz+=eye.xz;
        fade=smoothstep(0.,2.,p.y)*(1.-smoothstep(12.,18.,p.y));gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,
      fragmentShader:'uniform float rain;varying float fade;void main(){gl_FragColor=vec4(.72,.82,.85,rain*.35*fade);}'
    });
    this.rain=new THREE.LineSegments(geometry,material);this.rain.frustumCulled=false;world.scene.add(this.rain);
  }
  update(environment,time){
    const w=this.world,e=environment,weather=e.weather,day=e.daylight,hour=e.clock.hour,angle=(hour-6)/24*Math.PI*2;
    w.sunDirection.set(-Math.cos(angle),Math.sin(angle),-.32).normalize();
    w.sun.position.copy(w.sunDirection).multiplyScalar(220);this.moon.position.copy(w.sun.position).multiplyScalar(-1);this.moon.intensity=(1-day)*.22;
    const view=atmosphere(hour,day,weather,this.atmosphere),warm=view.warm;
    w.sun.color.setRGB(1,.96-warm*.23,.87-warm*.40);
    w.sun.intensity=view.sun;
    w.ambient.intensity=view.ambient;
    w.ambient.color.setRGB(.4+day*.43+warm*.035,.52+day*.38,.72+day*.23-warm*.09);
    w.ambient.groundColor.setRGB(.035+day*.055,.055+day*.065,.045+day*.035);
    w.scene.environmentIntensity=view.reflection;
    this.color.setRGB(.045,.07,.11).lerp(this.waterColor.setRGB(.60,.70,.70),day);
    this.color.lerp(this.waterColor.setRGB(.76,.63,.49),warm*.28);
    this.color.lerp(this.waterColor.setRGB(.43,.51,.55),weather.rain*day*.25);
    w.scene.fog.color.copy(this.color);w.scene.fog.density=view.fogDensity;
    const u=w.sky.material.uniforms;u.daylight.value=day;u.cloudCover.value=weather.cloud;u.rainAmount.value=weather.rain;u.skyTime.value=time;u.wind.value.set(weather.windX,weather.windZ);
    const water=w.water.material.uniforms;
    water.sunDirection.value.copy(w.sunDirection);water.sunColor.value.copy(w.sun.color).multiplyScalar(.15+day*.85);
    water.waterColor.value.setRGB(.018,.065,.09).lerp(this.waterColor.setRGB(.05,.28,.23),day);
    water.windStrength.value=.65+weather.wind*.2;water.windDirection.value.set(weather.windX,weather.windZ);water.rainAmount.value=weather.rain;
    w.landscape.wind.value.set(weather.windX,weather.windZ);
    w.landscape.rain.value=weather.rain;
    this.rain.visible=weather.rain>.005;
    this.rain.geometry.setDrawRange(0,(w.touchMode||!w.highQuality ? 110 : 420)*2);
    this.rain.material.uniforms.time.value=time;this.rain.material.uniforms.rain.value=weather.rain;this.rain.material.uniforms.wind.value.set(weather.windX,weather.windZ);
    w.fauna.update(e,time,w.touchMode||!w.highQuality);
    // Static scene shadows remain cached; refresh only when the light moves appreciably.
    if(time-this.lastShadow>3&&Math.abs(hour-this.lastHour)>.18){w.renderer.shadowMap.needsUpdate=true;this.lastShadow=time;this.lastHour=hour;}
  }
}

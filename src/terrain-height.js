// Existing procedural terrain functions, shared by rendering and walking.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function noise(x,y){
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  const hash=(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};
  const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  return (hash(ix,iy)*(1-u)+hash(ix+1,iy)*u)*(1-v)+(hash(ix,iy+1)*(1-u)+hash(ix+1,iy+1)*u)*v;
}
export function fbm(x,z){let sum=0,amp=.55;for(let i=0;i<4;i++){sum+=noise(x,z)*amp;x=x*2.03+7.1;z=z*2.03+4.3;amp*=.48;}return sum;}
export function terrainHeight(x,z){
  const r=Math.hypot(x/82,(z+42)/108),rise=smooth(1,1.72,r),envelope=Math.exp(-Math.pow((r-2)/1.5,2));
  const ridges=1-Math.abs(noise(x*.023+12,z*.023+8)*2-1);
  return -.1+rise*envelope*(13+fbm(x*.018+5,z*.018)*58+ridges*26);
}

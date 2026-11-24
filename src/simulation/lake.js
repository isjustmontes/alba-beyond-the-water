const smooth=(x,a,b)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// Shared by the simulation, lake bed and water shader.
export function lakeDepth(x,z) {
  const basin=smooth(1-Math.hypot(x/82,(z+42)/108),0,.22);
  const offshore=smooth(Math.hypot(x*.8,z-7),0,45);
  return .18+basin*(.65+offshore*4.5);
}

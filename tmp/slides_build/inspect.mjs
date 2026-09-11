import fs from 'node:fs/promises';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';
const base='E:/CL_Project/motionwifi';
const p=await PresentationFile.importPptx(await FileBlob.load(base+'/Adaptive Multi-Client Antenna Orientation Optimization for APs.pptx'));
const snap=await p.inspect({kind:'slide,textbox,shape,image,layout',maxChars:50000});
await fs.writeFile(base+'/tmp/slides_build/template-inspect.txt',snap.ndjson);
await fs.writeFile(base+'/tmp/slides_build/template-proto.json',JSON.stringify(p.toProto(),null,2));
console.log('SLIDES',p.slides.items.length,'MASTERS',p.masters.items.length);
for(let i=0;i<p.slides.items.length;i++){
 const s=p.slides.items[i];
 const b=await s.export({format:'png',scale:1});
 await fs.writeFile(base+`/tmp/slides_build/template-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));
 const l=await s.export({format:'layout'});
 await fs.writeFile(base+`/tmp/slides_build/template-${i+1}.json`,await l.text());
 console.log('Rendered',i+1);
}

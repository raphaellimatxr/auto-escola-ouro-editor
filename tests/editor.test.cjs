const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const script = process.env.EDITOR_SCRIPT ? fs.readFileSync(process.env.EDITOR_SCRIPT,'utf8') : fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
function harness(options = {}) {
  const draws = [], decodes = [], shares = [], urls = new Map(), trace=[];
  let id = 0, pendingBlob;
  class Element {
    constructor(name) { this.id = name; this.listeners = {}; this.value = ''; this.hidden = false; this.disabled = false; this.textContent = ''; this.attrs = {}; this.classList = { toggle(){},add(){},remove(){} }; }
    addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
    async fire(name, extra = {}) { const event = { target:this, preventDefault(){}, ...extra }; for (const fn of this.listeners[name] || []) await fn.call(this,event); }
    setAttribute(k,v) { this.attrs[k] = v; }
    set value(value) {this._value=value;if(this.id==='photoUpload'&&value===''){trace.push('input-cleared');for(const file of this.files||[])file.revoked=true;this.files=[];}}
    get value() {return this._value;}
    focus() { document.activeElement = this; }
    blur() { document.activeElement = null; }
    querySelector() { return this.span ||= new Element('span'); }
    querySelectorAll() { return [elements.closeExport, elements.shareArt, elements.downloadArt]; }
  }
  class Canvas extends Element {
    constructor(name) { super(name); this.width = this.height = 1080; }
    getContext() { return {setTransform(){},clearRect(){},fillRect(){},save(){},restore(){},scale(){},beginPath(){},rect(){},clip(){},translate(){},rotate(){},drawImage(...args){draws.push(args);},fillText(...args){this.lastText=args;},measureText(text){return {width:text.length * 50};} }; }
    getBoundingClientRect(){return {left:0,top:0,width:360,height:360};}
    setPointerCapture(){}
    toBlob(callback,type) { assert.equal(type,'image/png'); const finish = () => callback(new Blob(['PNG'],{type})); if(options.delayBlob)pendingBlob = finish; else queueMicrotask(finish); }
  }
  class Img {
    constructor(){this.width=784;this.height=821;this.naturalWidth=784;this.naturalHeight=821;}
    set src(value){this._src=value;if(value)queueMicrotask(()=>{if((options.badImages && value !== 'assets/moldura.png')||(options.failBlobImages&&value.startsWith('blob:'))) this.onerror?.(); else this.onload?.();});}
    get src(){return this._src;}
  }
  const elements = Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],m[1]==='poster'?new Canvas(m[1]):new Element(m[1])]));
  elements.studentName.value='Luís Abílio'; elements.zoom.value='1'; elements.exportLayer.hidden=true;
  const document = {getElementById:id=>elements[id],createElement:tag=>tag==='canvas'?new Canvas('reduced'):new Element(tag),body:new Element('body'),addEventListener(){}};
  const window = {addEventListener(){}};
  const navigator = {canShare:()=>!options.noShare, share:data=>{shares.push(data);return options.shareError?Promise.reject(options.shareError):Promise.resolve();}};
  const context = {document,window,navigator,location:{protocol:options.local?'file:':'https:'},Image:Img,HTMLImageElement:Img,HTMLCanvasElement:Canvas,Blob,File,Map,Promise,Math,Array,Number,String,URL:{createObjectURL(blob){if(blob.revoked)throw Error('NotReadableError');const url='blob:local/'+(++id);urls.set(url,blob);return url;},revokeObjectURL(url){urls.delete(url);}},requestAnimationFrame:fn=>queueMicrotask(fn),setTimeout,clearTimeout};
  if(!options.fallback)context.createImageBitmap=async(file,opts)=>{decodes.push(opts);if(file.revoked||options.badImages)throw Error('decode failed');return {width:1800,height:1350,close(){}};};
  context.FileReader=class{
    abort() {this.onabort?.();}
    readAsArrayBuffer(blob){queueMicrotask(()=>{if(blob.revoked||options.unreadable)this.onerror?.();else{this.result=new ArrayBuffer(blob.size);trace.push('bytes-copied');this.onload?.();}});}
    readAsDataURL(blob){queueMicrotask(()=>{if(blob.revoked||options.unreadable)this.onerror?.();else{this.result='data:image/jpeg;base64,dGVzdA==';this.onload?.();}});}
  };
  vm.runInNewContext(script,context);
  return {elements,draws,decodes,shares,urls,trace,finishBlob:()=>pendingBlob?.(),async upload(file={name:'foto.jpg',type:'image/jpeg',size:1000}){
    if(!options.noArrayBuffer)file.arrayBuffer=async()=>{trace.push('read-start');if(options.snapshotHook)await options.snapshotHook(file);await tick();if(file.revoked||options.unreadable||options.arrayBufferError)throw Error('NotReadableError');trace.push('bytes-copied');return new ArrayBuffer(file.size);};
    elements.photoUpload._value='C:\\fakepath\\'+file.name;elements.photoUpload.files=[file];await elements.photoUpload.fire('change');await tick();}};
}
(async()=>{
 const h=harness();await tick();const e=h.elements;
 assert.equal(e.saveArt.disabled,false,'initial assets ready');
 await h.upload();assert.match(e.fileInfo.textContent,/foto.jpg/);assert.equal(e.photoUpload.value,'','same photo can be selected again');assert.ok(h.trace.indexOf('bytes-copied')<h.trace.lastIndexOf('input-cleared'),'photo must be copied BEFORE input is cleared');assert.equal(h.decodes.length,0,'use Safari native image loader first');
 const reduced=h.draws.filter(args=>args[0] instanceof Object).length;assert.ok(reduced>0);
 e.studentName.value='Maria Vitória';await e.studentName.fire('input');await tick();assert.equal(e.nameCount.textContent,'13/45');
 await e.zoomIn.fire('click');assert.equal(e.zoomValue.textContent,'110%');await e.rotatePhoto.fire('click');assert.equal(e.zoomValue.textContent,'100%');
 await e.movePhoto.fire('click');assert.equal(e.movePhoto.attrs['aria-pressed'],'true');
 await e.poster.fire('pointerdown',{pointerId:1,clientX:130,clientY:130});await e.poster.fire('pointermove',{pointerId:1,clientX:155,clientY:150});await e.poster.fire('pointerup',{pointerId:1});await tick();
 await e.saveArt.fire('click');assert.equal(e.exportLayer.hidden,false);assert.equal(e.exportImage.hidden,false);assert.equal(e.exportCard.attrs['aria-busy'],'false');assert.match(e.downloadArt.download,/Maria_Vitoria.png$/);assert.equal(h.urls.get(e.downloadArt.href).type,'image/png');
 await e.shareArt.fire('click');assert.equal(h.shares.length,1);assert.equal(h.shares[0].files[0].type,'image/png');assert.equal(h.shares[0].files[0].name,e.downloadArt.download);
 await e.closeExport.fire('click');assert.equal(e.exportLayer.hidden,true);assert.equal(e.saveArt.disabled,false);
 await h.upload({name:'enorme.jpg',type:'image/jpeg',size:50*1024*1024});assert.match(e.status.textContent,/45 MB/);assert.equal(e.saveArt.disabled,false,'previous photo remains usable after error');
 const fallback=harness({fallback:true,noShare:true});await tick();await fallback.upload();assert.match(fallback.elements.fileInfo.textContent,/foto.jpg/);await fallback.elements.saveArt.fire('click');assert.equal(fallback.elements.shareArt.hidden,true);assert.equal(fallback.elements.exportImage.hidden,false);
 const bad=harness({badImages:true});await tick();await bad.upload();assert.match(bad.elements.status.textContent,/JPG ou PNG/);assert.equal(bad.elements.saveArt.disabled,true,'no valid photo means no export');
 const canceled=harness({shareError:Object.assign(Error('cancel'),{name:'AbortError'})});await tick();await canceled.elements.saveArt.fire('click');await canceled.elements.shareArt.fire('click');assert.match(canceled.elements.exportStatus.textContent,/cancelado/);assert.equal(canceled.elements.shareArt.disabled,false);
 const delayed=harness({delayBlob:true});await tick();const opening=delayed.elements.saveArt.fire('click');await delayed.elements.closeExport.fire('click');delayed.finishBlob();await opening;assert.equal(delayed.elements.exportLayer.hidden,true,'late export cannot reopen closed dialog');assert.equal(delayed.urls.size,0);
 let firstResolve;const race=harness({snapshotHook:file=>file.name==='first.jpg'?new Promise(resolve=>firstResolve=resolve):Promise.resolve()});await tick();const old=race.upload({name:'first.jpg',type:'image/jpeg',size:100});await race.upload({name:'latest.jpg',type:'image/jpeg',size:100});firstResolve();await old;assert.match(race.elements.fileInfo.textContent,/latest.jpg/,'latest selection wins');
 const readerOnly=harness({noArrayBuffer:true,local:true});await tick();await readerOnly.upload();assert.match(readerOnly.elements.fileInfo.textContent,/foto.jpg/);assert.equal(readerOnly.elements.localNotice.hidden,false);
 const retry=harness({arrayBufferError:true});await tick();await retry.upload();assert.match(retry.elements.fileInfo.textContent,/foto.jpg/,'FileReader snapshot fallback');
 const unreadable=harness({unreadable:true,local:true});await tick();await unreadable.upload();assert.match(unreadable.elements.status.textContent,/Abrir editor online/);
 const bitmap=harness({failBlobImages:true});await tick();await bitmap.upload();assert.match(bitmap.elements.fileInfo.textContent,/foto.jpg/);assert.equal(bitmap.decodes[0].imageOrientation,'from-image');
 await h.upload();await h.upload();assert.match(e.fileInfo.textContent,/foto.jpg/,'same photo can be loaded repeatedly');
 assert.ok(!html.includes('__FRAME_DATA__'));assert.match(fs.readFileSync(path.join(projectRoot, 'styles.css'), 'utf8'),/\[hidden\]\{display:none!important\}/);
 console.log('PASS: upload, same-file retry, fallback decoding, name, zoom, rotation, drag, PNG export, sharing, cancellation, error recovery and concurrent uploads.');
})().catch(error=>{console.error(error);process.exitCode=1;});

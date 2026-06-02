import { chromium } from 'playwright';
import fs from 'fs';
const OUT='/tmp/v31-shots/pkg-gap'; fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({channel:'chrome',headless:true});
const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const p=await ctx.newPage();
await p.goto('http://127.0.0.1:5191/#/packages',{waitUntil:'networkidle',timeout:30000}).catch(()=>{});
await p.waitForTimeout(1200);
await p.screenshot({path:`${OUT}/02_packages_after.png`,clip:{x:0,y:80,width:430,height:240}});
// /realtime 도 확인 (배너 없는 컨텍스트)
await p.evaluate(()=>{window.location.hash='#/realtime';});
await p.waitForTimeout(1200);
await p.screenshot({path:`${OUT}/03_realtime_after.png`,clip:{x:0,y:80,width:430,height:240}});
console.log('done');
await b.close();

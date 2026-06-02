import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome',headless:true});
const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const p=await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push('[pageerror] '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('[console.error] '+m.text());});
await p.goto('http://127.0.0.1:5191/#/realtime',{waitUntil:'networkidle',timeout:30000}).catch(()=>{});
await p.waitForTimeout(1500);
const r = await p.evaluate(()=>({
  h1: document.querySelector('h1')?.textContent?.trim(),
  hasSearch: [...document.querySelectorAll('button')].some(b=>b.textContent.includes('검색')),
  rootChildren: document.getElementById('root')?.children?.length || 0,
}));
console.log('rendered:', JSON.stringify(r));
console.log('errors:', errs.length);
errs.slice(0,8).forEach(e=>console.log(e));
await p.screenshot({path:'/tmp/v31-shots/airport-finder/15_blank_check.png',clip:{x:0,y:0,width:430,height:500}});
await b.close();

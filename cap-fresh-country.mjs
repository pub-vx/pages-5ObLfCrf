import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome',headless:true});
const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const p=await ctx.newPage();
// session 클리어 보장
await p.goto('http://127.0.0.1:5191/#/realtime',{waitUntil:'networkidle',timeout:30000}).catch(()=>{});
await p.evaluate(()=>sessionStorage.clear());
await p.reload({waitUntil:'networkidle'});
await p.waitForTimeout(1500);
// 나라 그리드 일본 클릭
await p.locator('button.flex-shrink-0.flex.flex-col:has-text("일본")').first().click();
await p.waitForTimeout(1500);
await p.screenshot({path:'/tmp/v31-shots/date-bug/02_fresh_session_to_search.png',clip:{x:0,y:0,width:430,height:240}});
const m = await p.evaluate(()=>{
  const sel = document.querySelector('button[class*="bg-[#272833]"]');
  const r = sel?.getBoundingClientRect();
  return {
    today: new Date().toISOString().slice(0,10),
    selText: sel?.textContent?.trim(),
    inView: r ? (r.left>=0 && r.right<=window.innerWidth && r.top>=0 && r.bottom<=window.innerHeight) : null,
    rect: r ? {x:Math.round(r.left), y:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height)} : null,
  };
});
console.log(JSON.stringify(m,null,2));
await b.close();

import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome',headless:true});
const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const p=await ctx.newPage();
await p.goto('http://127.0.0.1:5191/#/realtime',{waitUntil:'networkidle',timeout:30000}).catch(()=>{});
await p.waitForTimeout(1200);
// 나라 그리드의 일본 카드 클릭
await p.locator('button:has-text("일본")').first().click().catch(()=>{});
await p.waitForTimeout(1500);
await p.screenshot({path:'/tmp/v31-shots/date-bug/01_after_country_click.png',clip:{x:0,y:0,width:430,height:300}});
// selectedDate 상태 측정
const state = await p.evaluate(()=>{
  const sel = document.querySelector('button[class*="bg-[#272833]"]');
  const all = document.querySelectorAll('button');
  const dateButtons = [...all].filter(b=>{const t=b.textContent.trim(); return /^\d{1,2}$/.test(t.replace(/[월화수목금토일]/g,'').trim()) || /[월화수목금토일]/.test(t);});
  return {
    hasSelectedDarkBtn: !!sel,
    selectedText: sel?.textContent?.trim()?.slice(0,30),
    scrollLeft: document.querySelector('.flex-1.overflow-x-auto')?.scrollLeft,
    dateBtnCount: dateButtons.length,
  };
});
console.log(JSON.stringify(state,null,2));
await b.close();

// Checks sequential sends, stable row geometry, energy handling and reduced motion.
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(process.env.EXPORT_ROOT || 'dist');
const session = { ageRestricted: false, birthDate:'1990-01-01', email:'test@example.com', emailVerified:true, authMode:'signup', nickname:'Test', gender:null, preference:null, consent:{ aiAcknowledgedAt:1, termsAcceptedAt:1, versions:{terms:'2026-10-01',privacy:'2026-10-01',aiDisclosure:'2026-10-01'} } };
(async()=>{
for (const engine of process.env.BROWSER_ENGINES?.split(',') || ['chromium','webkit']) {
 const browser = await (engine === 'chromium' ? chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}) : webkit.launch());
 try {
 for (const [balance, reducedMotion] of [[20,'no-preference'],[0,'no-preference'],[20,'reduce']]) {
 const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion});
 const errors=[];
 if (!process.env.BASE_URL) await context.route('**/*', async route=>{
 const name=decodeURIComponent(new URL(route.request().url()).pathname).slice(1)||'index.html';
 const file=[name,`${name}.html`].map(n=>path.resolve(root,n)).find(f=>f.startsWith(root+'/')&&fs.existsSync(f)&&fs.statSync(f).isFile());
 if (!file) return route.fulfill({status:404,body:''});
 await route.fulfill({status:200,contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'})[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
 });
 await context.addInitScript(({session,balance})=>{
 localStorage.setItem('flirter.session.v1',JSON.stringify({state:session,version:0}));
 localStorage.setItem('flirter.chats.v1',JSON.stringify({state:{conversations:{maks:{characterId:'maks',origin:'chat',matchedAt:1,unreadCount:0,messages:[{id:'opening',author:'character',kind:'text',text:'Привіт! Малюю нову ілюстрацію й застрягла на головному герої. Допоможеш вигадати йому ім’я? 😊',createdAt:1,status:'sent'}]}}},version:2}));
 localStorage.setItem('flirter.energy.v1',JSON.stringify({state:{renewable:balance,purchased:0,regenAnchorAt:Date.now()},version:0}));
 },{session,balance});
 const page=await context.newPage(); page.on('pageerror',err=>errors.push(err.message));
 await page.goto(`${process.env.BASE_URL || 'http://quick-replies.test'}/chat/maks`);
 const chip=page.getByTestId('chat-quick-reply').first(); await chip.waitFor();
 const reply=await chip.innerText();
 // Hold to verify feedback, then release to send without touching the composer.
 const box=await chip.boundingBox(); await page.mouse.move(box.x+box.width/2,box.y+box.height/2); await page.mouse.down();
 await page.waitForTimeout(130);
 const transform=await chip.evaluate(el=>getComputedStyle(el).transform);
 if(reducedMotion==='reduce') assert(transform==='none'||transform==='matrix(1, 0, 0, 1, 0, 0)',transform);
 else assert(!['none','matrix(1, 0, 0, 1, 0, 0)'].includes(transform),transform);
 await page.mouse.up();
 if(balance>0){
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('flirter.chats.v1')).state.conversations.maks.messages.some(m=>m.author==='user'));
 const state=await page.evaluate(()=>({messages:JSON.parse(localStorage.getItem('flirter.chats.v1')).state.conversations.maks.messages,energy:JSON.parse(localStorage.getItem('flirter.energy.v1')).state.renewable}));
 assert.equal(state.messages.filter(m=>m.author==='user').length,1); assert.equal(state.messages.at(-1).text,reply); assert.equal(state.energy,19);
 assert.equal(await page.getByTestId('chat-input').inputValue(),''); assert.equal(await page.getByTestId('chat-quick-reply').count(),0);
 await page.waitForTimeout(300);
 assert(await page.getByTestId('chat-message').last().isVisible());
 // Manual send still works after the AI replies.
 await page.getByTestId('chat-quick-reply').first().waitFor({timeout:10000});
 await page.getByTestId('chat-input').fill('Manual message'); await page.getByTestId('chat-send').click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('flirter.chats.v1')).state.conversations.maks.messages.some(m=>m.text==='Manual message'));
 assert.equal(await page.getByTestId('chat-input').inputValue(),'');
 await page.getByTestId('chat-quick-reply').first().waitFor({timeout:10000});
 // Send another quick reply after both previous outgoing rows are no longer the latest.
 await page.getByTestId('chat-quick-reply').first().click();
 await page.getByTestId('chat-quick-reply').first().waitFor({timeout:10000});
 const rows=await page.getByTestId('chat-message').evaluateAll(nodes=>nodes.map(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom,height:el.parentElement.getBoundingClientRect().height,position:getComputedStyle(el).position})));
 for(let i=0;i<rows.length;i++){assert(rows[i].height>0,JSON.stringify(rows));assert.equal(rows[i].position,'relative');if(i)assert(rows[i].top>=rows[i-1].bottom,JSON.stringify(rows));}
 }else{
 await page.getByTestId('bottom-sheet').waitFor();
 const users=await page.evaluate(()=>JSON.parse(localStorage.getItem('flirter.chats.v1')).state.conversations.maks.messages.filter(m=>m.author==='user').length);
 assert.equal(users,0);assert.equal(await page.getByTestId('chat-input').inputValue(),'');
 }
 assert.deepEqual(errors,[]); console.log(`${engine}: balance=${balance}, motion=${reducedMotion} PASS`);
 await context.close();
 }
 } finally {await browser.close();}
}
})().catch(err=>{console.error(err);process.exit(1)});

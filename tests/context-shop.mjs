// Existing store regressions follow the new mobile conversational entry;
// desktop retains its direct T shortcut. This is test orchestration only.
export async function openContextualShop(page,mobile){
 if(mobile){
  await page.locator('#zone-travel').tap();
  await page.waitForFunction(()=>document.querySelector('.alba-dialogue').open);
  const catalog=page.getByRole('button',{name:/Ens\u00e9\u00f1ame lo que tienes/});await catalog.scrollIntoViewIfNeeded();await catalog.tap();
 }else await page.keyboard.press('t');
 await page.waitForFunction(()=>document.getElementById('shop-dialog').open&&window.__alba.snapshot().paused);
}

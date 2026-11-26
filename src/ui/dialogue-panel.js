// Presentation only: callers own narrative state and gameplay pause/input.
let panelId=0;
const node=(tag,className,text)=>{const el=document.createElement(tag);el.className=className;if(text!==undefined)el.textContent=text;return el;};

export class DialoguePanel {
  constructor({parent=document.body,parchment,onChoice=()=>{},onClose=()=>{}}={}){
    this.onChoice=onChoice;this.onClose=onClose;this.returnFocus=null;this.parchment=parchment;
    this.dialog=node('dialog','alba-dialogue');
    const id=`alba-dialogue-${++panelId}`;
    this.dialog.setAttribute('aria-labelledby',`${id}-name`);
    this.dialog.setAttribute('aria-describedby',`${id}-text`);
    this.sheet=node('div','alba-dialogue__sheet');
    this.closeButton=node('button','alba-dialogue__close','×');this.closeButton.type='button';this.closeButton.setAttribute('aria-label','Cerrar conversación');
    this.closeButton.onclick=()=>this.close();
    const portrait=node('figure','alba-dialogue__portrait');
    this.image=node('img','alba-dialogue__image');this.image.decoding='async';
    this.imageError=node('p','alba-dialogue__image-error','El retrato no se ha podido cargar.');this.imageError.hidden=true;
    this.image.onerror=()=>{this.image.hidden=true;this.imageError.hidden=false;this.updateScrollHint();};
    this.image.onload=()=>{this.image.hidden=false;this.imageError.hidden=true;this.updateScrollHint();};
    portrait.append(this.image,this.imageError);
    const content=node('section','alba-dialogue__content'),header=node('header','alba-dialogue__header');this.content=content;
    const eyebrow=node('p','alba-dialogue__eyebrow','HISTORIAS DE LA ALDEA');
    this.name=node('h2','alba-dialogue__name');this.name.id=`${id}-name`;this.name.tabIndex=-1;this.name.setAttribute('autofocus','');
    this.role=node('p','alba-dialogue__role');header.append(eyebrow,this.name,this.role);
    this.text=node('p','alba-dialogue__text');this.text.id=`${id}-text`;
    this.choices=node('div','alba-dialogue__choices');this.choices.setAttribute('role','group');this.choices.setAttribute('aria-label','Opciones de conversación');
    this.status=node('p','alba-dialogue__status');this.status.setAttribute('role','status');this.status.hidden=true;
    content.append(header,this.text,this.choices,this.status);this.sheet.append(portrait,content);
    this.scrollHint=node('p','alba-dialogue__scroll-hint','Desliza para ver las opciones ↓');this.scrollHint.hidden=true;
    this.dialog.append(this.sheet,this.closeButton,this.scrollHint);parent.append(this.dialog);
    for(const el of [this.sheet,this.content])el.addEventListener('scroll',()=>this.updateScrollHint());
    this.resize=new ResizeObserver(()=>this.updateScrollHint());this.resize.observe(this.sheet);this.resize.observe(this.content);
    this.dialog.addEventListener('close',()=>{this.returnFocus?.focus({preventScroll:true});this.returnFocus=null;this.onClose();});
  }
  show({speaker,text,choices=[]}){
    if(!this.dialog.open&&document.querySelector('dialog[open]'))return false;
    if(this.parchment)this.sheet.style.setProperty('--dialogue-parchment',`url("${this.parchment}")`);
    this.name.textContent=speaker.name;this.role.textContent=speaker.role||'';this.role.hidden=!speaker.role;
    this.image.alt=speaker.alt||`Retrato de ${speaker.name}`;
    this.image.hidden=false;this.imageError.hidden=true;
    if(this.image.getAttribute('src')!==speaker.portrait)this.image.src=speaker.portrait;
    else if(this.image.complete&&!this.image.naturalWidth){this.image.hidden=true;this.imageError.hidden=false;}
    this.text.textContent=text;this.setStatus('');this.choices.replaceChildren();
    choices.forEach((choice,index)=>{
      const button=node('button','alba-dialogue__choice');button.type='button';
      const number=node('span','alba-dialogue__number',String(index+1).padStart(2,'0'));number.setAttribute('aria-hidden','true');
      const label=node('span','alba-dialogue__choice-label',choice.label),arrow=node('span','alba-dialogue__arrow','↗');arrow.setAttribute('aria-hidden','true');
      button.append(number,label,arrow);button.disabled=!!choice.disabled;
      button.onclick=()=>this.onChoice(choice);this.choices.append(button);
    });
    if(!this.dialog.open){this.returnFocus=document.activeElement;this.dialog.showModal();}
    this.sheet.scrollTop=0;this.content.scrollTop=0;this.name.focus({preventScroll:true});this.updateScrollHint();
    return true;
  }
  updateScrollHint(){
    if(!this.dialog.open){this.scrollHint.hidden=true;return;}
    const scroller=this.content.scrollHeight>this.content.clientHeight+2?this.content:this.sheet;
    this.scrollHint.hidden=scroller.scrollHeight-scroller.scrollTop-scroller.clientHeight<6;
  }
  setStatus(text){this.status.textContent=text;this.status.hidden=!text;this.updateScrollHint();}
  close(){if(this.dialog.open)this.dialog.close();}
  dispose(){this.resize.disconnect();this.close();this.dialog.remove();}
}

'use strict';
const reports = window.NEWS || [];
const videos = window.VIDEOS || [];
const reportsById = new Map(reports.map(item => [item.id, item]));
const wire = [...reports].sort((a,b) => b.date.localeCompare(a.date));
const sections = ['মধ্যপ্রাচ্য','বিশ্ব','বাংলাদেশ','বিশ্লেষণ','মতামত','প্রতিরক্ষা','অর্থনীতি','প্রযুক্তি','এআই','সংস্কৃতি','খেলা','এক্সপ্লেইনার','বিশেষ'];
const regions = ['বিশ্ব','আমেরিকা','এশিয়া','ইউরোপ','আফ্রিকা'];
const telegram = 'https://t.me/ilhamIntNews';
const sampleTime = new Date('2026-11-05T18:00:00+06:00');
const breakingWindow = new Map([['1487',new Date('2026-11-05T19:15:00+06:00')]]);
const isBreaking = item => breakingWindow.has(item.id) && breakingWindow.get(item.id) > sampleTime;
const safe = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const bn = n => Number(n).toLocaleString('bn-BD',{useGrouping:false});
const byDate = (item, options) => new Date(item.date+'+06:00').toLocaleString('bn-BD',{timeZone:'Asia/Dhaka',...options});
const clock = item => byDate(item,{hour:'2-digit',minute:'2-digit',hour12:false});
const date = item => byDate(item,{day:'numeric',month:'long'});
function timeAgo(timestamp, now) {
  const minutes = Math.floor((now - Date.parse(timestamp)) / 60000);
  if (minutes < 1) return 'এইমাত্র';
  if (minutes < 60) return bn(minutes) + ' মিনিট আগে';
  if (minutes < 1440) return bn(Math.floor(minutes / 60)) + ' ঘণ্টা আগে';
  return bn(Math.floor(minutes / 1440)) + ' দিন আগে';
}
const select = tag => wire.filter(item => item.cat===tag || item.tags.includes(tag));
const ids = values => values.map(id=>reportsById.get(id)).filter(Boolean);
let region = 'বিশ্ব', showBreaking = false, visibleCount = 14, returnFocus;
const icons = {
 search:'<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
 chevrons:'<path d="m4 6 6 6-6 6m8-12 6 6-6 6"/>',
 arrow:'<path d="M3 12h16m-6-6 6 6-6 6"/>', up:'<path d="m5 16 13-12M8 4h10v10"/>',
 menu:'<path d="M3 6h18M3 12h18M3 18h12"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>',
 play:'<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
 googleNews:'<path d="M4 3h15v12H4z" fill="#34a853"/><path d="m2 7 16-2 2 11-16 2z" fill="#fbbc04"/><path d="m7 6 15 3-2 11-15-3z" fill="#ea4335"/><rect x="3" y="9" width="18" height="13" rx="1.5" fill="#4285f4"/><path d="M11.5 13a3.3 3.3 0 1 0 .8 2.6H9.4m5.2-.8h4m-4 3h4" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>',
 paper:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M7 7h10M7 11h4v4H7zM14 11h3m-3 4h3M7 18h10"/>',
 time:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 print:'<path d="M6 8V3h12v5M6 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6zM18 11h1"/>',
 share:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="5" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5m-7.6 6.9 7.6 4.5"/>',
 link:'<path d="m10 14 4-4m-6.5 5.5-1 1a3 3 0 0 0 4.2 4.2l4-4a3 3 0 0 0 0-4.2m1.8-4 1-1a3 3 0 0 0-4.2-4.2l-4 4a3 3 0 0 0 0 4.2"/>',
 facebook:'<circle cx="12" cy="12" r="10"/><path d="M13 19v-6h2l.4-2.5H13V9.2c0-.8.3-1.2 1.3-1.2H16V5.5h-2.1c-2.5 0-3.7 1.4-3.7 3.6v1.4H8V13h2.2v6" fill="currentColor" stroke="none"/>',
 twitter:'<path d="M4 4h4.5L20 20h-4.5L4 4Zm15.5 0L4.5 20"/>',
 instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.7" r=".8" fill="currentColor" stroke="none"/>',
 whatsapp:'<path d="M20.7 11.7a8.7 8.7 0 0 1-12.9 7.6L4 20.5l1.2-3.8a8.7 8.7 0 1 1 15.5-5Z"/><path d="M8.5 8c-.7.3-.9 1.1-.5 2.1 1 2.5 3.3 4.8 5.9 5.6.9.3 1.7-.1 2.1-.8l-2.4-1.4-.9.8a7.4 7.4 0 0 1-3.1-3.1l.8-.9L9.1 8Z" fill="currentColor" stroke="none"/>',
 more:'<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>',
 telegram:'<path fill="currentColor" stroke="none" d="M21.8 3.1c.6-.3 1.2.2 1.1 1l-3.4 16.2c-.2.9-.9 1.1-1.6.6l-5.2-3.8-2.5 2.4c-.3.2-.5.4-.9.4l.4-5.4L19.5 6c.4-.4-.1-.5-.6-.2L6.8 13.4l-5.2-1.6c-1.1-.3-1.1-1.1.2-1.6z"/>'
};
function icon(name){return '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>'}
const url = (page,param='') => '#'+page+(param?'/'+encodeURIComponent(param):'');
const anchor = (page,label,param='',cl='') => '<a class="'+cl+'" href="'+url(page,param)+'">'+label+'</a>';
const story = (n,content,cl='') => anchor('article',content,n.id,cl);
const img = (n,eager=false) => '<span class="imageFrame"><img src="'+safe(n.image)+'" loading="'+(eager?'eager':'lazy')+'" alt="'+safe(n.title||'')+'"></span>';
const badge = (n, label=n.cat) => '<span class="desk">'+safe(label)+'</span>';
const logo = (dark=false) => anchor('home','<img src="assets/'+(dark?'brand-light.png':'brand-logo.png')+'" alt="Ilham News">','','logo');
const tg = (cl='') => '<a class="tg '+cl+'" href="'+telegram+'" target="_blank" rel="noopener">'+icon('telegram')+'টেলিগ্রামে যুক্ত হোন</a>';
const ext = (label,path) => '<a target="_blank" rel="noopener" href="https://ilhamnews.com/'+path+'">'+label+'</a>';
function pageState(){const parts=location.hash.slice(1).split('/');try{return [parts[0]||'home',decodeURIComponent(parts.slice(1).join('/'))]}catch{return ['home','']}}
function navLink(page,param,label,view,section){const active=view===page && (page!=='section'||section===param);return '<a href="'+url(page,param)+'"'+(active?' aria-current="page"':'')+'>'+label+'</a>'}
function header(view, section) {
  const categories = ['মধ্যপ্রাচ্য','বিশ্ব','বিশ্লেষণ','মতামত','বাংলাদেশ','অর্থনীতি','প্রতিরক্ষা','প্রযুক্তি','এআই','খেলা'];
  return `<header class="siteHeader">
    <div class="mastheadTop">
      <div class="mastheadInner">
        <div class="utility">
          <div class="wrap">
            <span>বৃহস্পতিবার, ৫ নভেম্বর ২০২৬ <i></i> ২১ কার্তিক ১৪৩৩</span>
            <div><span class="demo">ডিজাইন প্রিভিউ</span>${ext(icon('paper')+' ই-পেপার','epaper')}</div>
          </div>
        </div>
        <div class="mast wrap">
          ${logo()}
          <p>বস্তুনিষ্ঠ সংবাদ । অন্তরালের খবর<br>নির্ভরযোগ্য তথ্য । নিরপেক্ষ বিশ্লেষণ</p>
          <div class="mastActions">
            ${tg()}
            <button data-tool="search" class="iconbutton" aria-label="সংবাদ খুঁজুন">${icon('search')}</button>
            <button data-tool="menu" class="iconbutton" aria-label="সব বিভাগ">${icon('menu')}</button>
          </div>
        </div>
      </div>
    </div>
    <div class="navBand">
      <nav class="wrap" aria-label="প্রধান মেনু">
        <a class="navBrand" href="${url('home')}" aria-label="Ilham News প্রচ্ছদ" inert><span></span></a>
        <div class="navLinks">
          ${navLink('home','','প্রচ্ছদ',view,section)}
          ${navLink('latest','','সর্বশেষ',view,section)}
          ${categories.map(category => navLink('section',category,category,view,section)).join('')}
          ${navLink('videos','',icon('play')+' ভিডিও',view,section)}
        </div>
      </nav>
    </div>
  </header>`;
}

function syncHeader() {
  const masthead = document.querySelector('.siteHeader');
  if (!masthead) return;
  const wasCompact = masthead.classList.contains('is-compact');
  // Keep a small gap between collapse and expand thresholds to prevent flicker.
  const compact = window.scrollY > (wasCompact ? 4 : 20);
  if (wasCompact === compact) return;
  masthead.classList.toggle('is-compact', compact);
  masthead.querySelector('.mastheadTop').inert = compact;
  masthead.querySelector('.navBrand').inert = !compact;
}
const more=(page,param='',label='সব খবর')=>anchor(page,label+' '+icon('arrow'),param,'more');
function sectionHead(label,page='',param=''){
  const heading=page?anchor(page,safe(label)+icon('chevrons'),param,'sectionHeadingLink'):safe(label);
  return '<div class="sectionHead"><h2>'+heading+'</h2></div>';
}
function itemCard(n,section,label){return story(n,img(n)+'<div>'+(n.cat===section?'':badge(n,label))+'<h3>'+safe(n.title)+'</h3></div>','card')}
function listItem(n){return story(n,img(n)+'<div>'+badge(n)+'<h3>'+safe(n.title)+'</h3></div>','listItem')}
function wireItem(n,wide){return story(n,'<div class="wireMeta"><time>'+clock(n)+'</time><span>'+safe(n.cat)+'</span>'+(isBreaking(n)?'<strong class="break">ব্রেকিং</strong>':'')+'</div><h3>'+safe(n.title)+'</h3>'+(wide?'<p>'+safe(n.summary)+'</p>':''),'wireItem'+(isBreaking(n)?' flagged':''))}
function frontUpdates(){
  const limit = 5;
  const recent = wire.slice(0, limit);
  const urgent = wire.find(isBreaking);
  if (!urgent || recent.includes(urgent)) return recent;
  return [urgent, ...recent.slice(0, limit - 1)];
}
let feedView = 'latest';
const popularStories = () => ids(['1231','1347','1004','1413','1458']);
function compactUpdate(n){return story(n,'<time>'+clock(n)+'</time><div>'+(isBreaking(n)?'<strong class="break">ব্রেকিং</strong>':'')+'<h3>'+safe(n.title)+'</h3></div>','compactUpdate'+(isBreaking(n)?' breakingUpdate':''));}
function feedPanel() {
  const panes = [['latest','সর্বশেষ'],['popular','সর্বাধিক পঠিত'],['discussed','সর্বাধিক আলোচিত']];
  const tabs = panes.map(([key,label]) => {
    const selected = feedView===key;
    return `<button type="button" role="tab" id="feed-tab-${key}" aria-controls="feed-${key}" data-pane="${key}" aria-selected="${selected}" tabindex="${selected?0:-1}">${label}</button>`;
  }).join('');
  const discussed = wire.map(item => {
    const comments = readComments(item.id);
    return {item, count: comments.length + comments.reduce((total, comment)=>total+(comment.replies?.length||0),0)};
  }).filter(({count})=>count>0).sort((a,b)=>b.count-a.count).slice(0,5).map(({item})=>item);
  const rankedList = items => '<ol>'+items.map(n=>'<li>'+story(n,'<h3>'+safe(n.title)+'</h3>')+'</li>').join('')+'</ol>';
  const contents = {
    latest: frontUpdates().map(compactUpdate).join('')+more('latest','','সব আপডেট দেখুন'),
    popular: rankedList(popularStories()),
    discussed: discussed.length ? rankedList(discussed) : '<p class="feedEmpty">এখনো কোনো মন্তব্য নেই।</p>'
  };
  const panels = panes.map(([key]) => `<div class="slidingPane" id="feed-${key}" role="tabpanel" aria-labelledby="feed-tab-${key}"${feedView===key?'':' hidden inert'}><div>${contents[key]}</div></div>`).join('');
  return `<aside class="feedPanel"><div class="feedTabs" role="tablist" aria-label="খবরের তালিকা">
    <span class="feedIndicator" aria-hidden="true"></span>${tabs}</div><div class="feedBody slidingPanes">${panels}</div></aside>`;
}

function measureFeedTab() {
  const tabs = document.querySelector('.feedTabs');
  if (!tabs) return;
  const selected = tabs.querySelector('[aria-selected="true"]');
  tabs.style.setProperty('--feed-indicator-x', selected.offsetLeft+'px');
  tabs.style.setProperty('--feed-indicator-y', selected.offsetTop+selected.offsetHeight+'px');
  tabs.style.setProperty('--feed-indicator-width', selected.offsetWidth+'px');
  if (!tabs.classList.contains('is-ready')) {
    tabs.querySelector('.feedIndicator').getBoundingClientRect();
    tabs.classList.add('is-ready');
  }
}

const slideCleanup = new WeakMap();

function selectSlidingTab(button) {
  const tabList = button.parentElement;
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const current = tabs.find(tab=>tab.getAttribute('aria-selected')==='true');
  if (button===current) return;

  const outgoing = document.getElementById(current.getAttribute('aria-controls'));
  const incoming = document.getElementById(button.getAttribute('aria-controls'));
  const viewport = incoming.parentElement;
  slideCleanup.get(viewport)?.();

  const direction = tabs.indexOf(button)>tabs.indexOf(current) ? 1 : -1;
  current.setAttribute('aria-selected','false');
  current.tabIndex = -1;
  button.setAttribute('aria-selected','true');
  button.tabIndex = 0;
  outgoing.inert = true;
  incoming.hidden = false;
  incoming.inert = false;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    outgoing.hidden = true;
    return;
  }

  outgoing.classList.add('is-leaving');
  const options = {duration:380,easing:'cubic-bezier(.3,.7,.2,1)'};
  const enter = incoming.animate([{transform:`translateX(${direction*100}%)`},{transform:'translateX(0)'}],options);
  const exit = outgoing.animate([{transform:'translateX(0)'},{transform:`translateX(${direction*-100}%)`}],options);
  const finish = () => {
    enter.onfinish = null;
    enter.cancel();
    exit.cancel();
    outgoing.hidden = true;
    outgoing.classList.remove('is-leaving');
    slideCleanup.delete(viewport);
  };
  slideCleanup.set(viewport,finish);
  enter.onfinish = finish;
}

function switchFeedTab(button) {
  feedView = button.dataset.pane;
  selectSlidingTab(button);
  measureFeedTab();
}
function mobileAlert(){const n=wire.find(isBreaking);return n?anchor('latest','<strong>ব্রেকিং</strong><span>'+safe(n.title)+'</span>'+icon('arrow'),'','mobileFlash'):''}
function briefRow(n,label){
  return story(n,'<div>'+(label?badge(n,label):'')+'<h3>'+safe(n.title)+'</h3><small>'+date(n)+'</small></div>'+img(n),'briefRow');
}
function feature(n,primary=false,label){
  const tag=primary?'h1':'h3';
  return story(n,img(n,primary)+'<div>'+(label?badge(n,label):'')+'<'+tag+'>'+safe(n.title)+'</'+tag+'><p>'+safe(n.summary)+'</p><small>'+date(n)+'</small></div>','feature');
}
function front(){
  return '<section class="opening">'+sectionHead('টপ নিউজ','section','প্রধান শিরোনাম')+'<div class="openingGrid">'+
    '<div class="leadBriefs">'+ids(['1480','1478','1450']).map(n=>briefRow(n)).join('')+'</div>'+
    feature(reportsById.get('1463'),true)+feedPanel()+'</div></section>';
}
function regionLabel(n) {
  if (n.id==='1482') return 'ইউরোপ';
  if (n.cat==='মধ্যপ্রাচ্য') return n.cat;
  return regions.slice(1).find(label=>label===n.cat || n.tags.includes(label)) || n.cat;
}
function storySpread(items){
  if(items.length<5)return '<div class="shortSpread">'+items.slice(0,4).map(n=>itemCard(n,undefined,regionLabel(n))).join('')+'</div>';
  const [lead,...rest]=items.slice(0,7);
  const middle=Math.ceil(rest.length/2);
  return '<div class="spread"><div class="flank">'+rest.slice(0,middle).map(n=>briefRow(n,regionLabel(n))).join('')+'</div>'+
    feature(lead,false,regionLabel(lead))+'<div class="flank">'+rest.slice(middle).map(n=>briefRow(n,regionLabel(n))).join('')+'</div></div>';
}
function videoTile(v){return '<button class="videoTile" data-video="'+safe(v.id)+'"><span class="videoImage"><img loading="lazy" src="'+safe(v.image)+'" alt=""><span class="playIcon">'+icon('play')+'</span><small>'+safe(v.duration)+'</small></span><strong>'+safe(v.title)+'</strong></button>'}
function videoBand(){
  if (!videos.length) return '';
  const controls=videos.length>1
    ? '<button class="videoArrow previous" type="button" data-video-step="-1" aria-label="আগের ভিডিও">'+icon('arrow')+'</button>'+
      '<button class="videoArrow next" type="button" data-video-step="1" aria-label="পরের ভিডিও">'+icon('arrow')+'</button>'
    : '';
  return '<section class="videoBand"><div class="wrap">'+sectionHead('ভিডিও','videos')+
    '<div class="videoCarousel">'+controls+'<div class="videoViewport"><div class="videoTiles">'+videos.map(videoTile).join('')+'</div></div></div></div></section>';
}

function stepVideos(carousel, direction) {
  const track=carousel.querySelector('.videoTiles');
  if (track.dataset.sliding || track.children.length<2) return;

  const first=track.firstElementChild;
  const last=track.lastElementChild;
  const forward=direction>0;
  const rotate=()=>forward?track.append(first):track.prepend(last);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    rotate();
    return;
  }

  const distance=track.children[1].offsetLeft-first.offsetLeft;
  const copy=(forward?first:last).cloneNode(true);
  copy.inert=true;
  copy.setAttribute('aria-hidden','true');
  if (forward) track.append(copy);
  else track.prepend(copy);
  track.dataset.sliding='true';
  const animation=track.animate(
    [{transform:'translateX('+ (forward?0:-distance) +'px)'}, {transform:'translateX('+ (forward?-distance:0) +'px)'}],
    {duration:350,easing:'ease-in-out'}
  );
  animation.onfinish=()=>{
    copy.remove();
    rotate();
    delete track.dataset.sliding;
  };
}

let videoTimer;
function scheduleVideos() {
  clearInterval(videoTimer);
  const carousel=document.querySelector('.videoCarousel');
  if (!carousel?.querySelector('.videoArrow')) return;
  videoTimer=setInterval(()=>{
    if (!document.hidden && !document.querySelector('dialog[open]') &&
        !carousel.matches(':hover, :focus-within') &&
        !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stepVideos(carousel,1);
    }
  },4000);
}
function world() {
  const tabs = regions.map((name,index) => {
    const selected = name===region;
    return `<button type="button" role="tab" id="region-tab-${index}" aria-controls="region-${index}" data-region="${name}" aria-selected="${selected}" tabindex="${selected?0:-1}">${name}</button>`;
  }).join('');
  const panels = regions.map((name,index) => {
    const items = name==='বিশ্ব' ? ids(['1465','1473','1482','1454','1481','1433','1376']) : select(name);
    return `<div class="slidingPane" id="region-${index}" role="tabpanel" aria-labelledby="region-tab-${index}"${name===region?'':' hidden inert'}>${storySpread(items)}</div>`;
  }).join('');
  return `<section class="world">${sectionHead('আন্তর্জাতিক','section','আন্তর্জাতিক')}
    <div class="tabs" role="tablist" aria-label="অঞ্চল">${tabs}</div><div class="slidingPanes">${panels}</div>
  </section>`;
}
function department(tag){return '<section class="department">'+sectionHead(tag,'section',tag)+select(tag).slice(0,3).map(n=>briefRow(n)).join('')+'</section>'}
function opinion(){return '<section class="opinion">'+sectionHead('মতামত','section','মতামত')+'<div class="grid3">'+select('মতামত').slice(0,3).map(n=>story(n,'<small>'+safe(n.author||'মতামত বিভাগ')+'</small><h3>'+safe(n.title)+'</h3>')).join('')+'</div></section>'}

function ranked(){
  const sample=popularStories();
  return '<section class="ranked">'+sectionHead('সর্বাধিক পঠিত')+'<ol>'+sample.map(n=>'<li>'+story(n,'<h3>'+safe(n.title)+'</h3>')+'</li>').join('')+'</ol></section>';
}
function panorama(tag, count=3){
  return '<section>'+sectionHead(tag,'section',tag)+'<div class="grid3">'+select(tag).slice(0,count).map(n=>itemCard(n)).join('')+'</div></section>';
}
function sports(){
  const [lead,second,...rest]=select('খেলা');
  return '<section class="sports">'+sectionHead('খেলা','section','খেলা')+
    '<div class="sportsGrid">'+story(lead,img(lead)+'<div><h3>'+safe(lead.title)+'</h3><small>'+date(lead)+'</small></div>','sportCover')+
    itemCard(second)+'<div class="flank">'+rest.map(n=>briefRow(n)).join('')+'</div></div></section>';
}
function smallNews(n,withDate=false,section=''){return story(n,img(n)+'<div>'+(withDate||n.cat===section?'':badge(n))+'<h3>'+safe(n.title)+'</h3>'+(withDate?'<small>'+date(n)+'</small>':'')+'</div>','smallNews');}
function leftImageDepartment(tag,hideMatchingTag=false){return '<section class="department">'+sectionHead(tag,'section',tag)+select(tag).slice(0,3).map(n=>smallNews(n,false,hideMatchingTag?tag:undefined)).join('')+'</section>';}
function editorialPair(){return '<div class="editorialPair"><section>'+sectionHead('বিশ্লেষণ','section','বিশ্লেষণ')+select('বিশ্লেষণ').slice(0,4).map(n=>smallNews(n,true)).join('')+'</section><section>'+sectionHead('মতামত','section','মতামত')+select('মতামত').slice(0,4).map(n=>story(n,'<span class="quoteMark" aria-hidden="true">“</span><div class="opinionText"><h3>'+safe(n.title)+'</h3><small><span>লেখা:</span> '+safe(n.author||'মতামত বিভাগ')+'</small></div>','opinionRow')).join('')+'</section></div>';}
function home(){
  return '<div class="wrap">'+front()+world()+'</div>'+videoBand()+
    '<div class="wrap">'+editorialPair()+
    '<div class="departments">'+department('মধ্যপ্রাচ্য')+department('প্রতিরক্ষা')+'</div>'+
    '<section class="bangladesh">'+sectionHead('বাংলাদেশ','section','বাংলাদেশ')+'<div class="grid4">'+select('বাংলাদেশ').slice(0,4).map(n=>itemCard(n,'বাংলাদেশ')).join('')+'</div></section>'+
    '<div class="departments">'+leftImageDepartment('এক্সপ্লেইনার')+leftImageDepartment('অর্থনীতি')+'</div>'+
    '<div class="departments">'+leftImageDepartment('প্রযুক্তি',true)+leftImageDepartment('এআই',true)+'</div>'+
    '<div class="departments">'+leftImageDepartment('সংস্কৃতি',true)+leftImageDepartment('খেলা',true)+'</div>'+
    '<section class="specialSection">'+sectionHead('বিশেষ প্রতিবেদন','section','বিশেষ')+'<div class="grid4">'+select('বিশেষ').slice(0,4).map(n=>itemCard(n)).join('')+'</div></section></div>';
}
function footer(){return '<footer><div class="wrap"><div class="footMark">'+logo(true)+'<span>বস্তুনিষ্ঠ সংবাদ । অন্তরালের খবর</span></div><div class="footerGrid"><section><h2>সংবাদ বিভাগ</h2><div class="footCategories">'+sections.map(s=>anchor('section',s,s)).join('')+'</div></section><section><h2>ইলহাম নিউজ</h2>'+ext('আমাদের সম্পর্কে','about')+ext('যোগাযোগ','contact')+ext('বিজ্ঞাপন দিন','advertise')+ext('ই-পেপার','epaper')+anchor('videos','ভিডিও')+'</section><section class="telegramBox"><div class="tgIcon">'+icon('telegram')+'</div><div><h2>টেলিগ্রামে ইলহাম নিউজ</h2><p>নতুন খবর ও গুরুত্বপূর্ণ আপডেট পেতে আমাদের চ্যানেলে যোগ দিন।</p>'+tg('light')+'</div></section></div><div class="footBase"><span>© ২০২৬ Ilham News</span><div><a href="https://facebook.com/ilhamintnews" target="_blank" rel="noopener">Facebook</a><a href="https://youtube.com/@ilhamintnews" target="_blank" rel="noopener">YouTube</a><a href="https://instagram.com/ilhamintnews" target="_blank" rel="noopener">Instagram</a></div></div></div></footer>'}

function crumb(name){return '<div class="crumb">'+anchor('home','প্রচ্ছদ')+' <span>/</span> '+safe(name)+'</div>';}
function shelf(n){
  return story(n,'<div>'+badge(n)+'<h3>'+safe(n.title)+'</h3><small>'+date(n)+'</small></div>'+img(n),'shelf');
}
function latestPage() {
  const now = Date.now();
  const groups = new Map();
  for (const item of wire) {
    const day = date(item);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day).push(item);
  }
  const rows = [...groups].map(([day, items]) => `<div data-latest-group>
    <div class="latestFold"><div><h2 class="dayLabel">${day}</h2></div></div>
    ${items.map(item => {
      const breaking = isBreaking(item);
      const timestamp = item.date+'+06:00';
      return `<div class="latestFold" data-latest-item${breaking?' data-breaking':''}><div><div class="moment">
        <time datetime="${safe(timestamp)}"><strong>${timeAgo(timestamp,now)}</strong> <span aria-hidden="true">·</span> ${clock(item)}</time>
        ${story(item,'<div>'+badge(item)+(breaking?' <strong class="break">ব্রেকিং</strong>':'')+
          '<h3>'+safe(item.title)+'</h3><p>'+safe(item.summary)+'</p></div>'+img(item), 'dispatch'+(breaking?' urgent':''))}
      </div></div></div>`;
    }).join('')}
  </div>`).join('');
  return `<div class="wrap inside"><div class="latestHeader">
    <div class="latestSheen" aria-hidden="true"></div>
    ${crumb('সর্বশেষ')}
    <div class="bulletinHead"><h1><span class="latestPulse" aria-hidden="true"></span>সর্বশেষ আপডেট</h1>
      <div class="filters latestFilters" role="tablist" aria-label="আপডেটের ধরন">
        <span class="latestIndicator" aria-hidden="true"></span>
        <button type="button" id="latest-all" role="tab" aria-controls="latest-list" aria-selected="true" data-filter="all">সব আপডেট</button>
        <button type="button" id="latest-breaking" role="tab" aria-controls="latest-list" aria-selected="false" tabindex="-1" data-filter="breaking">শুধু ব্রেকিং</button>
      </div>
    </div>
  </div><div class="bulletin">
    <section id="latest-list" role="tabpanel" aria-labelledby="latest-all">${rows}
      <p data-latest-empty hidden>এখন কোনো ব্রেকিং আপডেট নেই।</p>
      <button type="button" data-more class="load" hidden>আরও আপডেট ↓</button>
    </section>
    <aside>${ranked()}</aside>
  </div></div>`;
}

function measureLatestFilter() {
  const filters = document.querySelector('.latestFilters');
  if (!filters) return;
  const selected = filters.querySelector('[aria-selected="true"]');
  filters.style.setProperty('--indicator-x', selected.offsetLeft+'px');
  filters.style.setProperty('--indicator-width', selected.offsetWidth+'px');
}

function syncLatestList() {
  const list = document.querySelector('#latest-list');
  const filters = document.querySelector('.latestFilters');
  const active = showBreaking ? 'breaking' : 'all';
  for (const tab of filters.querySelectorAll('[role="tab"]')) {
    const selected = tab.dataset.filter === active;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  list.setAttribute('aria-labelledby', 'latest-'+active);
  filters.dataset.active = active;
  let count = 0;
  for (const group of list.querySelectorAll('[data-latest-group]')) {
    let visible = false;
    for (const item of group.querySelectorAll('[data-latest-item]')) {
      const eligible = !showBreaking || item.hasAttribute('data-breaking');
      const hide = !eligible || count >= visibleCount;
      if (eligible) count++;
      visible ||= !hide;
      item.classList.toggle('is-hidden', hide);
      item.inert = hide;
    }
    const heading = group.firstElementChild;
    heading.classList.toggle('is-hidden', !visible);
    heading.inert = !visible;
  }
  list.querySelector('[data-latest-empty]').hidden = count > 0;
  list.querySelector('[data-more]').hidden = count <= visibleCount;
  measureLatestFilter();
}
function searchPage(title,items){
  return '<section class="wrap inside">'+crumb('অনুসন্ধান')+'<div class="bulletinHead"><h1>'+safe(title)+'</h1><small>'+bn(items.length)+'টি ফলাফল</small></div><div class="searchResults">'+(items.map(shelf).join('')||'<p>কোনো প্রতিবেদন পাওয়া যায়নি।</p>')+'</div></section>';
}
function listing(title,items){
  const cards=items.map(n=>story(n,img(n)+'<div><small>'+date(n)+' '+bn(Number(n.date.slice(0,4)))+
    '</small><h2>'+safe(n.title)+'</h2><p>'+safe(n.summary)+'</p></div>', 'sectionEntry')).join('');
  return '<section class="wrap inside">'+crumb(title)+'<div class="sectionMast"><h1>'+safe(title)+'</h1><span>'+bn(items.length)+
    'টি প্রতিবেদন</span></div><div class="sectionGrid">'+cards+'</div></section>';
}
function articleShare(n) {
  const permalink = new URL(url('article', n.id), location.href);
  permalink.search = '';
  const link = encodeURIComponent(permalink.href);
  const title = encodeURIComponent(n.title);
  const platforms = [
    ['facebook', 'ফেসবুক', 'https://www.facebook.com/sharer/sharer.php?u='+link],
    ['twitter', 'টুইটার', 'https://twitter.com/intent/tweet?url='+link+'&text='+title],
    ['instagram', 'ইন্সটাগ্রাম', 'https://www.instagram.com/'],
    ['telegram', 'টেলিগ্রাম', 'https://t.me/share/url?url='+link+'&text='+title],
    ['whatsapp', 'হোয়াটসঅ্যাপ', 'https://wa.me/?text='+title+'%20'+link]
  ];
  return `<div class="articleActions" data-article-link="${safe(permalink.href)}">
    <div class="articleShareControls" role="group" aria-label="শেয়ার করার মাধ্যম">
      ${platforms.map(([id,label,href])=>`<a class="articleAction" href="${safe(href)}" target="_blank" rel="noopener" aria-label="${label}" title="${id==='instagram'?'লিংক কপি করে ইন্সটাগ্রাম খুলুন':label}"${id==='instagram'?' data-instagram':''}>${icon(id)}</a>`).join('')}
      <button type="button" class="articleAction" data-copy-article aria-label="লিংক কপি" title="লিংক কপি">${icon('link')}</button>
      <button type="button" class="articleAction" data-share-other aria-label="অন্যান্য মাধ্যমে শেয়ার" title="অন্যান্য মাধ্যমে শেয়ার">${icon('share')}</button>
    </div>
    <div class="articleTextControls" role="group" aria-label="লেখার আকার ও প্রিন্ট">
      <button type="button" data-text-size="-1" aria-label="লেখা ছোট করুন">−</button>
      <button type="button" data-text-size="0" aria-label="স্বাভাবিক আকারে ফেরান">অ</button>
      <button type="button" data-text-size="1" aria-label="লেখা বড় করুন">+</button>
      <button type="button" class="articleAction" data-print-article aria-label="প্রিন্ট" title="প্রিন্ট">${icon('print')}</button>
    </div>
  </div>`;
}

async function copyArticleLink(actions, instagram=false) {
  const status = actions.closest('.articleReader').querySelector('.articleShareStatus');
  const link = actions.dataset.articleLink;
  try {
    await navigator.clipboard.writeText(link);
    status.textContent = instagram ? 'লিংক কপি হয়েছে। ইন্সটাগ্রামে পেস্ট করুন।' : 'লিংক কপি হয়েছে।';
  } catch {
    showArticleLink(link);
  }
}

function showArticleLink(link) {
  dialog('প্রতিবেদনের লিংক', '<input class="articleLinkField" aria-label="প্রতিবেদনের লিংক" readonly value="'+safe(link)+'"><p><a class="more" href="mailto:?body='+encodeURIComponent(link)+'">ইমেইলে পাঠান</a></p>');
  document.querySelector('dialog .articleLinkField').select();
}

async function shareArticleOther(actions) {
  const link = actions.dataset.articleLink;
  if (navigator.share) {
    try {
      await navigator.share({title: document.querySelector('.articleIntro h1').textContent, url: link});
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  showArticleLink(link);
}

function readComments(id) {
  try {
    const comments = JSON.parse(localStorage.getItem('ilham-comments-'+id) || '[]');
    return Array.isArray(comments) ? comments : [];
  }
  catch { return []; }
}
function commentsSection(id) {
  const comments=readComments(id);
  const thread=comments.map(comment=>`<div class="commentItem">
    <strong>${safe(comment.name)}</strong><p>${safe(comment.message)}</p>
    <button type="button" data-comment-reply="${safe(comment.id)}">উত্তর দিন</button>
    ${(comment.replies||[]).map(reply=>`<div class="commentReply"><strong>${safe(reply.name)}</strong><p>${safe(reply.message)}</p></div>`).join('')}
  </div>`).join('');
  return `<section class="comments" data-article-id="${safe(id)}">
    <h2>মন্তব্য <span>${bn(comments.length)}</span></h2>
    <p class="commentsNote">প্রিভিউতে মন্তব্য এই ব্রাউজারে সংরক্ষিত থাকবে।</p>
    <form class="commentForm" data-comments>
      <p class="replyTarget" hidden></p>
      <input name="name" type="text" maxlength="80" required placeholder="আপনার নাম" aria-label="আপনার নাম">
      <textarea name="message" maxlength="2000" required rows="3" placeholder="আপনার মন্তব্য লিখুন" aria-label="আপনার মন্তব্য"></textarea>
      <div class="commentFormActions"><button type="button" data-cancel-reply hidden>বাতিল</button><button type="submit">মন্তব্য পাঠান</button></div>
      <p class="commentError" role="status"></p>
    </form>
    <div class="commentList">${thread || '<p class="commentsEmpty">এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন।</p>'}</div>
  </section>`;
}

function article(n) {
  const tags = [...new Set(n.tags)];
  const titleWords = [...new Set(n.title.normalize().split(/[\s,।:?!()‘’“”–-]+/u))]
    .filter(word=>word.length >= 5);
  const related = wire.filter(item=>item.id!==n.id)
    .map(item=>({
      item,
      score: 4 * titleWords.filter(word=>item.title.normalize().includes(word)).length
        + tags.filter(tag=>item.tags.includes(tag)).length
        + (item.cat===n.cat ? 2 : 0)
    }))
    .filter(({score})=>score>0)
    .sort((a,b)=>b.score-a.score)
    .slice(0,10)
    .map(({item})=>item);
  const recommendation = related[0];
  const readMore = recommendation ? `<aside class="articleReadMore" aria-label="আরও পড়ুন">
    <h2>আরও পড়ুন</h2>
    ${story(recommendation,icon('paper')+'<span>'+safe(recommendation.title)+'</span>'+icon('chevrons'))}
  </aside>` : '';
  const insertAfter = Math.min(2, n.body.length);
  const latest = wire.filter(item=>item.id!==n.id).slice(0,5);
  const numbered = (title,items) => `<section class="articleRanked"><h2>${title}</h2><ol>${items.map(item=>'<li>'+story(item,safe(item.title))+'</li>').join('')}</ol></section>`;
  const published = byDate(n, {day:'numeric', month:'long', year:'numeric'});
  return `<div class="wrap articlePage"><aside class="articleSideLeft">${numbered('সর্বশেষ খবর',latest)}</aside><article class="inside articleReader">
    ${crumb(n.cat)}
    <header class="articleIntro">
      ${anchor('section',safe(n.cat),n.cat,'desk')}
      <h1>${safe(n.title)}</h1>
      <p>${safe(n.summary)}</p>
    </header>
    <div class="articleMeta">
      <div class="articleAuthor"><div>
        <strong class="articleByline">${safe(n.author || 'ইলহাম নিউজ')}</strong>
        <time datetime="${safe(n.date+'+06:00')}">${icon('time')} প্রকাশ ${published} · ${clock(n)}</time>
      </div></div>
      ${articleShare(n)}
    </div>
    <p class="articleShareStatus" role="status"></p>
    <figure class="articlePhoto">
      ${img(n,true)}
      ${n.caption ? `<figcaption>${safe(n.caption)}</figcaption>` : ''}
    </figure>
    <div class="articleBody">
      ${n.body.slice(0, insertAfter).map(paragraph=>`<p>${safe(paragraph)}</p>`).join('')}
      ${readMore}
      ${n.body.slice(insertAfter).map(paragraph=>`<p>${safe(paragraph)}</p>`).join('')}
      <a class="more" href="${safe(n.source)}" target="_blank" rel="noopener">মূল প্রতিবেদন পড়ুন ${icon('up')}</a>
    </div>
    <div class="articleEndMatter">
      <a class="articleGoogleNews" href="https://news.google.com/search?q=site%3Ailhamnews.com&amp;hl=bn&amp;gl=BD&amp;ceid=BD%3Abn" target="_blank" rel="noopener">${icon('googleNews')}<span>গুগল নিউজে ইলহাম নিউজের খবর দেখুন</span>${icon('up')}</a>
      ${tags.length ? `<nav class="articleTags" aria-label="খবরের বিষয়"><span>বিষয়</span>${tags.map(tag=>anchor('section',safe(tag),tag)).join('')}</nav>` : ''}
    </div>
    ${commentsSection(n.id)}
  </article>
    <aside class="articleSideRight"><section class="articleRelated"><h2>সংশ্লিষ্ট খবর</h2>
      ${related.map((item,index)=>`<div class="articleRelatedItem"${index>=5?' hidden':''}>${story(item,img(item)+'<span>'+safe(item.title)+'</span>')}</div>`).join('')}
      ${related.length===0?'<p>এই মুহূর্তে সংশ্লিষ্ট খবর নেই।</p>':''}
      ${related.length>5?'<button type="button" class="articleMore" data-related-more>আরও</button>':(related.length?anchor('section','আরও',n.cat,'articleMore'):'')}
    </section>
    <section class="articleNewsletter" aria-labelledby="newsletter-title">
      <div class="newsletterIcon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></div>
      <h2 id="newsletter-title">প্রতিদিন সন্ধ্যা ৮:৩০টায় দিনের প্রধান খবর পেতে আপনার ইমেইল দিন।</h2>
      <p>সন্ধ্যার নির্বাচিত গুরুত্বপূর্ণ খবর সরাসরি আপনার ইনবক্সে।</p>
      <form class="newsletterForm"><label class="newsletterLabel" for="newsletter-email">আপনার ইমেইল</label><input id="newsletter-email" type="email" placeholder="আপনার ইমেইল" required><button type="submit">সাবস্ক্রাইব</button></form>
      <small>বিনামূল্যে, যেকোনো সময় আনসাবস্ক্রাইব</small><p class="newsletterStatus" role="status"></p>
    </section></aside></div>`;
}

function adjustArticleText(button) {
  const reader = button.closest('.articleReader');
  const step = Number(button.dataset.textSize);
  const size = step === 0 ? 0 : Math.max(-2, Math.min(2, Number(reader.dataset.textScale || 0) + step));
  reader.dataset.textScale = size;
  reader.style.setProperty('--article-text-adjustment', size * 2 + 'px');
}
function watch(param) {
  const current = videos.find(video => video.id === param) || videos[0];
  if (!current) {
    return '<section class="wrap watchPage"><h1>ভিডিও</h1><p>এখন কোনো ভিডিও নেই।</p></section>';
  }

  const playlist = videos.map(video => `
    <a class="watchItem" href="${url('videos', video.id)}"${video === current ? ' aria-current="true"' : ''}>
      ${img(video)}
      <span><strong>${safe(video.title)}</strong><small>${safe(video.duration)}</small></span>
    </a>
  `).join('');

  return `<section class="wrap watchPage">
    <div class="watchHeading">
      <h1>ভিডিও</h1>
      <button class="more" type="button" data-watch-list>সব ভিডিও ${icon('arrow')}</button>
    </div>
    <div class="watchGrid">
      <div class="watchFeature">
        <div class="watchPlayer">
          <video playsinline preload="metadata" poster="${safe(current.image)}" src="${safe(current.url)}" aria-labelledby="watch-title"></video>
          <button type="button" class="watchPlay" data-watch-play aria-label="ভিডিও চালান">
            <span>${icon('play')}</span>
          </button>
        </div>
        <h2 id="watch-title">${safe(current.title)}</h2>
        <p>${safe(current.description)}</p>
      </div>
      <aside class="watchList" aria-label="সব ভিডিও">${playlist}</aside>
    </div>
  </section>`;
}
function playFeaturedVideo(button) {
  const video = button.previousElementSibling;
  video.controls = true;
  button.hidden = true;
  video.focus({ preventScroll: true });
  video.play().catch(() => {
    // Native controls remain available if playback does not start.
  });
}
function render(){const [page,param]=pageState();let view=home;if(page==='latest')view=latestPage;if(page==='videos')view=()=>watch(param);if(page==='section')view=()=>listing(param,select(param));if(page==='article'&&reportsById.has(param))view=()=>article(reportsById.get(param));if(page==='search')view=()=>searchPage('অনুসন্ধান · '+param,wire.filter(n=>(n.title+' '+n.summary+' '+n.tags.join(' ')).includes(param)));document.querySelector('#publication').innerHTML=header(page,param)+'<main id="main" data-page="'+page+'">'+view()+'</main>'+footer();syncHeader();scheduleVideos();measureFeedTab();if(page==='home')document.fonts.ready.then(measureFeedTab);if(page==='latest'){
    syncLatestList();
    const main=document.querySelector('main[data-page=latest]');
    main.getBoundingClientRect();
    main.classList.add('latestReady');
    document.fonts.ready.then(measureLatestFilter);
  }document.title=(page==='home'?'প্রচ্ছদ':page==='videos'?'ভিডিও':document.querySelector('main h1')?.textContent||'সংবাদ')+' | Ilham News'}
function dialog(title,body){const d=document.createElement('dialog');returnFocus=document.activeElement;d.innerHTML='<div class="dialogHead"><h2>'+safe(title)+'</h2><button data-close aria-label="বন্ধ করুন">'+icon('close')+'</button></div>'+body;document.body.append(d);d.addEventListener('close',()=>{d.querySelector('video')?.pause();d.remove();returnFocus?.focus()},{once:true});d.showModal()}
document.addEventListener('keydown',event=>{
  const tab = event.target.closest(':is(.latestFilters, .feedTabs, .world .tabs) [role="tab"]');
  if (tab && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
    event.preventDefault();
    const tabs = [...tab.parentElement.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(tab);
    const step = event.key==='ArrowLeft' ? -1 : 1;
    const next = event.key==='Home' ? tabs[0] : event.key==='End' ? tabs.at(-1) : tabs[(index+step+tabs.length)%tabs.length];
    next.focus();
    next.click();
    return;
  }
  if (event.key !== 'Escape') return;
  const share = document.querySelector('.articleShare[open]');
  if (!share || !share.contains(document.activeElement)) return;
  share.open = false;
  share.querySelector('summary').focus();
});
document.addEventListener('click',e=>{
  const share = document.querySelector('.articleShare[open]');
  if (share && !share.contains(e.target)) share.open = false;
  const el=e.target.closest('a,button');
  if(!el)return;
  if (el.matches('.feedTabs [data-pane]')) { switchFeedTab(el); return; }
  if (el.matches('.world [data-region]')) {
    region = el.dataset.region;
    selectSlidingTab(el);
    return;
  }
  if (el.matches('.latestFilters [data-filter]')) {
    showBreaking = el.dataset.filter === 'breaking';
    syncLatestList();
    return;
  }
  if (el.matches('#latest-list [data-more]')) {
    visibleCount += 14;
    syncLatestList();
    return;
  }
  if (el.hasAttribute('data-comment-reply')) {
    const section=el.closest('.comments'), form=section.querySelector('form');
    form.dataset.replyTo=el.dataset.commentReply;
    const author=el.closest('.commentItem').querySelector('strong').textContent;
    const target=form.querySelector('.replyTarget');
    target.textContent=author+'-এর মন্তব্যের উত্তর লিখুন';
    target.hidden=false;
    form.querySelector('[data-cancel-reply]').hidden=false;
    form.querySelector('[name=message]').focus();
    return;
  }
  if (el.hasAttribute('data-cancel-reply')) {
    const form=el.closest('form');
    delete form.dataset.replyTo;
    form.querySelector('.replyTarget').hidden=true;
    el.hidden=true;
    return;
  }
  if (el.hasAttribute('data-related-more')) {
    document.querySelectorAll('.articleRelatedItem[hidden]').forEach(item=>item.hidden=false);
    el.remove();
    return;
  }
  if (el.hasAttribute('data-text-size')) {
    adjustArticleText(el);
    return;
  }
  const actions=el.closest('.articleActions');
  if (actions) {
    if (el.hasAttribute('data-print-article')) window.print();
    if (el.matches('[data-copy-article], [data-instagram]')) copyArticleLink(actions, el.hasAttribute('data-instagram'));
    if (el.hasAttribute('data-share-other')) shareArticleOther(actions);
    return;
  }
  if (el.hasAttribute('data-video-step')) {
    stepVideos(el.closest('.videoCarousel'), Number(el.dataset.videoStep));
    scheduleVideos();
    return;
  }
  if (el.hasAttribute('data-watch-play')) {
    playFeaturedVideo(el);
    return;
  }
  if (el.hasAttribute('data-watch-list')) {
    document.querySelector('.watchList a')?.focus();
    return;
  }
  if(el.matches('.navBrand')&&pageState()[0]==='home')window.scrollTo(0,0);if(el.matches('dialog a,[data-close]'))document.querySelector('dialog')?.close();if(el.dataset.tool==='menu')dialog('সব বিভাগ','<div class="menuGrid">'+anchor('home','প্রচ্ছদ')+anchor('latest','সর্বশেষ')+anchor('videos','ভিডিও')+sections.map(s=>anchor('section',s,s)).join('')+'</div>');if(el.dataset.tool==='search')dialog('সংবাদ খুঁজুন','<form data-search><label>শিরোনাম বা বিষয়<input autofocus required type="search" name="term" placeholder="যেমন: ইরান"></label><button>খুঁজুন</button></form>');if(el.dataset.video){const v=videos.find(x=>String(x.id)===el.dataset.video);if(v)dialog(v.title,'<video controls playsinline autoplay poster="'+safe(v.image)+'" src="'+safe(v.url)+'"></video><p>'+safe(v.description)+'</p><a class="more" href="'+safe(v.source)+'" target="_blank" rel="noopener">সূত্র ↗</a>')}});
document.addEventListener('submit',e=>{
  if (e.target.matches('[data-comments]')) {
    e.preventDefault();
    const form=e.target, section=form.closest('.comments');
    const name=form.elements.name.value.trim(), message=form.elements.message.value.trim();
    if (!name || !message) { form.querySelector('.commentError').textContent='নাম ও মন্তব্য লিখুন।'; return; }
    const comments=readComments(section.dataset.articleId);
    const replyTo=form.dataset.replyTo;
    if (replyTo) {
      const parent=comments.find(comment=>comment.id===replyTo);
      if (!parent) { form.querySelector('.commentError').textContent='মূল মন্তব্যটি পাওয়া যায়নি।'; return; }
      parent.replies ||= [];
      parent.replies.push({name,message});
    } else {
      comments.push({id:crypto.randomUUID(),name,message,replies:[]});
    }
    try {
      localStorage.setItem('ilham-comments-'+section.dataset.articleId,JSON.stringify(comments));
      section.outerHTML=commentsSection(section.dataset.articleId);
      document.querySelector('.comments h2').scrollIntoView({block:'nearest'});
    } catch { form.querySelector('.commentError').textContent='মন্তব্য সংরক্ষণ করা যায়নি।'; }
    return;
  }
  if(!e.target.matches('[data-search]'))return;e.preventDefault();const q=e.target.term.value.trim();if(q){document.querySelector('dialog')?.close();location.hash=url('search',q)}});
window.addEventListener('scroll', syncHeader, { passive: true });
window.addEventListener('pageshow', syncHeader);

const pageLoading = document.querySelector('#page-loading');
const publication = document.querySelector('#publication');
let navigationId = 0;

function visiblePageMedia() {
  return [...publication.querySelectorAll('img, video[poster]')].filter(element => {
    const rect = element.getBoundingClientRect();
    return rect.width && rect.height && rect.bottom > 0 && rect.right > 0 &&
      rect.top < window.innerHeight && rect.left < window.innerWidth;
  });
}

async function loadPage(initial = false) {
  const id = ++navigationId;
  const minimumDisplay = new Promise(resolve => setTimeout(resolve, 260));
  publication.setAttribute('aria-busy', 'true');
  pageLoading.classList.add('is-active');

  if (!initial && document.visibilityState === 'visible') {
    // Paint the overlay before replacing the current page.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
  if (id !== navigationId) return;

  try {
    if (!initial) window.scrollTo(0, 0);
    render();
    const mediaReady = visiblePageMedia().map(element => {
      if (element.tagName === 'IMG') {
        element.loading = 'eager';
        return element.decode();
      }
      const poster = new Image();
      poster.src = element.poster;
      return poster.decode();
    });
    await Promise.allSettled([minimumDisplay, document.fonts.ready, ...mediaReady]);
  } finally {
    if (id === navigationId) {
      publication.removeAttribute('aria-busy');
      pageLoading.classList.remove('is-active');
    }
  }
}

window.addEventListener('resize', measureLatestFilter);
window.addEventListener('resize', measureFeedTab);
document.fonts.addEventListener('loadingdone', measureLatestFilter);
document.fonts.addEventListener('loadingdone', measureFeedTab);

window.addEventListener('hashchange', () => {
  document.querySelector('dialog')?.close();
  visibleCount = 14;
  showBreaking = false;
  loadPage();
});
loadPage(true);

// The newsletter box is a design preview until a subscription service is connected.
document.addEventListener('submit', event => {
  if (!event.target.matches('.newsletterForm')) return;
  event.preventDefault();
  event.target.closest('.articleNewsletter').querySelector('.newsletterStatus').textContent = 'নিউজলেটার সেবাটি এখনো চালু হয়নি।';
});

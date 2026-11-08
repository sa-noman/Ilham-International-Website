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
 arrow:'<path d="M3 12h16m-6-6 6 6-6 6"/>', up:'<path d="m5 16 13-12M8 4h10v10"/>',
 menu:'<path d="M3 6h18M3 12h18M3 18h12"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>',
 play:'<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
 paper:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M7 7h10M7 11h4v4H7zM14 11h3m-3 4h3M7 18h10"/>',
 time:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 telegram:'<path fill="currentColor" stroke="none" d="M21.8 3.1c.6-.3 1.2.2 1.1 1l-3.4 16.2c-.2.9-.9 1.1-1.6.6l-5.2-3.8-2.5 2.4c-.3.2-.5.4-.9.4l.4-5.4L19.5 6c.4-.4-.1-.5-.6-.2L6.8 13.4l-5.2-1.6c-1.1-.3-1.1-1.1.2-1.6z"/>'
};
function icon(name){return '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>'}
const url = (page,param='') => '#'+page+(param?'/'+encodeURIComponent(param):'');
const anchor = (page,label,param='',cl='') => '<a class="'+cl+'" href="'+url(page,param)+'">'+label+'</a>';
const story = (n,content,cl='') => anchor('article',content,n.id,cl);
const img = (n,eager=false) => '<span class="imageFrame"><img src="'+safe(n.image)+'" loading="'+(eager?'eager':'lazy')+'" alt="'+safe(n.title||'')+'"></span>';
const badge = n => '<span class="desk">'+safe(n.cat)+'</span>';
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
  const heading=page?anchor(page,safe(label),param):safe(label);
  return '<div class="sectionHead"><h2>'+heading+'</h2></div>';
}
function itemCard(n){return story(n,img(n)+'<div>'+badge(n)+'<h3>'+safe(n.title)+'</h3></div>','card')}
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
function feedPanel(){
  const tabs = [['latest','সর্বশেষ'],['popular','সর্বাধিক পঠিত']].map(([key,label]) =>
    '<button data-pane="'+key+'" aria-pressed="'+(feedView===key)+'">'+label+'</button>').join('');
  const contents = feedView==='latest'
    ? frontUpdates().map(compactUpdate).join('')+more('latest','','সব আপডেট দেখুন')
    : '<ol>'+popularStories().map(n=>'<li>'+story(n,'<h3>'+safe(n.title)+'</h3>')+'</li>').join('')+'</ol>';
  return '<aside class="feedPanel"><div class="feedTabs" role="group" aria-label="খবরের তালিকা">'+tabs+'</div><div class="feedBody">'+contents+'</div></aside>';
}
function mobileAlert(){const n=wire.find(isBreaking);return n?anchor('latest','<strong>ব্রেকিং</strong><span>'+safe(n.title)+'</span>'+icon('arrow'),'','mobileFlash'):''}
function briefRow(n){
  return story(n,'<div><h3>'+safe(n.title)+'</h3><small>'+date(n)+'</small></div>'+img(n),'briefRow');
}
function feature(n,primary=false){
  const tag=primary?'h1':'h3';
  return story(n,img(n,primary)+'<div><'+tag+'>'+safe(n.title)+'</'+tag+'><p>'+safe(n.summary)+'</p><small>'+date(n)+'</small></div>','feature');
}
function front(){
  return '<section class="opening">'+sectionHead('টপ নিউজ','section','প্রধান শিরোনাম')+'<div class="openingGrid">'+
    '<div class="leadBriefs">'+ids(['1480','1478','1450']).map(briefRow).join('')+'</div>'+
    feature(reportsById.get('1463'),true)+feedPanel()+'</div></section>';
}
function storySpread(items){
  if(items.length<5)return '<div class="shortSpread">'+items.slice(0,4).map(itemCard).join('')+'</div>';
  const [lead,...rest]=items.slice(0,7);
  const middle=Math.ceil(rest.length/2);
  return '<div class="spread"><div class="flank">'+rest.slice(0,middle).map(briefRow).join('')+'</div>'+
    feature(lead)+'<div class="flank">'+rest.slice(middle).map(briefRow).join('')+'</div></div>';
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
function world(){
  const items=region==='বিশ্ব'?ids(['1465','1473','1482','1454','1481','1433','1376']):select(region);
  return '<section class="world">'+sectionHead('আন্তর্জাতিক','section','আন্তর্জাতিক')+
    '<div class="tabs">'+regions.map(s=>'<button data-region="'+s+'" aria-pressed="'+(s===region)+'">'+s+'</button>').join('')+
    '</div>'+storySpread(items)+'</section>';
}
function department(tag){return '<section class="department">'+sectionHead(tag,'section',tag)+select(tag).slice(0,3).map(briefRow).join('')+'</section>'}
function opinion(){return '<section class="opinion">'+sectionHead('মতামত','section','মতামত')+'<div class="grid3">'+select('মতামত').slice(0,3).map(n=>story(n,'<small>'+safe(n.author||'মতামত বিভাগ')+'</small><h3>'+safe(n.title)+'</h3>')).join('')+'</div></section>'}

function ranked(){
  const sample=popularStories();
  return '<section class="ranked">'+sectionHead('সর্বাধিক পঠিত')+'<ol>'+sample.map(n=>'<li>'+story(n,'<h3>'+safe(n.title)+'</h3>')+'</li>').join('')+'</ol></section>';
}
function panorama(tag, count=3){
  return '<section>'+sectionHead(tag,'section',tag)+'<div class="grid3">'+select(tag).slice(0,count).map(itemCard).join('')+'</div></section>';
}
function sports(){
  const [lead,second,...rest]=select('খেলা');
  return '<section class="sports">'+sectionHead('খেলা','section','খেলা')+
    '<div class="sportsGrid">'+story(lead,img(lead)+'<div><h3>'+safe(lead.title)+'</h3><small>'+date(lead)+'</small></div>','sportCover')+
    itemCard(second)+'<div class="flank">'+rest.map(briefRow).join('')+'</div></div></section>';
}
function smallNews(n,withDate=false){return story(n,img(n)+'<div>'+(withDate?'':badge(n))+'<h3>'+safe(n.title)+'</h3>'+(withDate?'<small>'+date(n)+'</small>':'')+'</div>','smallNews');}
function leftImageDepartment(tag){return '<section class="department">'+sectionHead(tag,'section',tag)+select(tag).slice(0,3).map(n=>smallNews(n)).join('')+'</section>';}
function editorialPair(){return '<div class="editorialPair"><section>'+sectionHead('বিশ্লেষণ','section','বিশ্লেষণ')+select('বিশ্লেষণ').slice(0,4).map(n=>smallNews(n,true)).join('')+'</section><section>'+sectionHead('মতামত','section','মতামত')+select('মতামত').slice(0,4).map(n=>story(n,'<span class="quoteMark" aria-hidden="true">“</span><div class="opinionText"><h3>'+safe(n.title)+'</h3><small><span>লেখা:</span> '+safe(n.author||'মতামত বিভাগ')+'</small></div>','opinionRow')).join('')+'</section></div>';}
function home(){
  return '<div class="wrap">'+front()+world()+'</div>'+videoBand()+
    '<div class="wrap">'+editorialPair()+
    '<div class="departments">'+department('মধ্যপ্রাচ্য')+department('প্রতিরক্ষা')+'</div>'+
    '<section class="bangladesh">'+sectionHead('বাংলাদেশ','section','বাংলাদেশ')+'<div class="grid4">'+select('বাংলাদেশ').slice(0,4).map(itemCard).join('')+'</div></section>'+
    '<div class="departments">'+leftImageDepartment('এক্সপ্লেইনার')+leftImageDepartment('অর্থনীতি')+'</div>'+
    '<div class="departments">'+leftImageDepartment('প্রযুক্তি')+leftImageDepartment('এআই')+'</div>'+
    '<div class="departments">'+leftImageDepartment('সংস্কৃতি')+leftImageDepartment('খেলা')+'</div>'+
    '<section class="specialSection">'+sectionHead('বিশেষ প্রতিবেদন','section','বিশেষ')+'<div class="grid4">'+select('বিশেষ').slice(0,4).map(itemCard).join('')+'</div></section></div>';
}
function footer(){return '<footer><div class="wrap"><div class="footMark">'+logo(true)+'<span>বস্তুনিষ্ঠ সংবাদ । অন্তরালের খবর</span></div><div class="footerGrid"><section><h2>সংবাদ বিভাগ</h2><div class="footCategories">'+sections.map(s=>anchor('section',s,s)).join('')+'</div></section><section><h2>ইলহাম নিউজ</h2>'+ext('আমাদের সম্পর্কে','about')+ext('যোগাযোগ','contact')+ext('বিজ্ঞাপন দিন','advertise')+ext('ই-পেপার','epaper')+anchor('videos','ভিডিও')+'</section><section class="telegramBox"><div class="tgIcon">'+icon('telegram')+'</div><div><h2>টেলিগ্রামে ইলহাম নিউজ</h2><p>নতুন খবর ও গুরুত্বপূর্ণ আপডেট পেতে আমাদের চ্যানেলে যোগ দিন।</p>'+tg('light')+'</div></section></div><div class="footBase"><span>© ২০২৬ Ilham News</span><div><a href="https://facebook.com/ilhamintnews" target="_blank" rel="noopener">Facebook</a><a href="https://youtube.com/@ilhamintnews" target="_blank" rel="noopener">YouTube</a><a href="https://instagram.com/ilhamintnews" target="_blank" rel="noopener">Instagram</a></div></div></div></footer>'}

function crumb(name){return '<div class="crumb">'+anchor('home','প্রচ্ছদ')+' <span>/</span> '+safe(name)+'</div>';}
function shelf(n){
  return story(n,'<div>'+badge(n)+'<h3>'+safe(n.title)+'</h3><small>'+date(n)+'</small></div>'+img(n),'shelf');
}
function latestPage(){
  const items=wire.filter(n=>!showBreaking||isBreaking(n));
  const now=Date.now();
  let day='';
  const rows=items.slice(0,visibleCount).map(n=>{
    const key=date(n), group=day===key?'':'<h2 class="dayLabel">'+key+'</h2>';day=key;
    const timestamp=n.date+'+06:00';
    return group+'<div class="moment"><time datetime="'+safe(timestamp)+'"><strong>'+timeAgo(timestamp,now)+'</strong> <span aria-hidden="true">·</span> '+clock(n)+'</time>'+story(n,'<div>'+badge(n)+(isBreaking(n)?' <strong class="break">ব্রেকিং</strong>':'')+
      '<h3>'+safe(n.title)+'</h3><p>'+safe(n.summary)+'</p></div>'+img(n), 'dispatch'+(isBreaking(n)?' urgent':''))+'</div>';

  }).join('');
  return '<div class="wrap inside">'+crumb('সর্বশেষ')+'<div class="bulletinHead"><h1>সর্বশেষ আপডেট</h1><div class="filters">'+
    ['সব আপডেট','শুধু ব্রেকিং'].map((t,i)=>'<button data-filter="'+(i?'breaking':'all')+'" aria-pressed="'+(Boolean(i)===showBreaking)+'">'+t+'</button>').join('')+
    '</div></div><div class="bulletin"><section>'+rows+(items.length?'':'<p>এখন কোনো ব্রেকিং আপডেট নেই।</p>')+
    (items.length>visibleCount?'<button data-more class="load">আরও আপডেট ↓</button>':'')+'</section><aside>'+tg()+ranked()+'</aside></div></div>';
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
function article(n){
  const related=select(n.cat).filter(x=>x.id!==n.id).slice(0,3);
  return '<article class="wrap inside readerV2">'+crumb(n.cat)+'<div class="articleSpread"><div>'+
    anchor('section',safe(n.cat),n.cat,'desk')+'<h1>'+safe(n.title)+'</h1><small>'+safe(n.author||'ইলহাম নিউজ')+' · '+date(n)+' '+bn(new Date(n.date).getFullYear())+'</small></div><figure>'+img(n,true)+'</figure></div>'+
    '<div class="readingZone"><section><p class="standfirst">'+safe(n.summary)+'</p>'+n.body.map(p=>'<p>'+safe(p)+'</p>').join('')+
    '<a class="more" href="'+safe(n.source)+'" target="_blank" rel="noopener">মূল প্রতিবেদন পড়ুন '+icon('up')+'</a></section><aside>'+
    (related.length?sectionHead('সম্পর্কিত খবর')+related.map(shelf).join(''):'')+'</aside></div></article>';
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
function render(){const [page,param]=pageState();let view=home;if(page==='latest')view=latestPage;if(page==='videos')view=()=>watch(param);if(page==='section')view=()=>listing(param,select(param));if(page==='article'&&reportsById.has(param))view=()=>article(reportsById.get(param));if(page==='search')view=()=>searchPage('অনুসন্ধান · '+param,wire.filter(n=>(n.title+' '+n.summary+' '+n.tags.join(' ')).includes(param)));document.querySelector('#publication').innerHTML=header(page,param)+'<main id="main" data-page="'+page+'">'+view()+'</main>'+footer();syncHeader();scheduleVideos();document.title=(page==='home'?'প্রচ্ছদ':page==='videos'?'ভিডিও':document.querySelector('main h1')?.textContent||'সংবাদ')+' | Ilham News'}
function dialog(title,body){const d=document.createElement('dialog');returnFocus=document.activeElement;d.innerHTML='<div class="dialogHead"><h2>'+safe(title)+'</h2><button data-close aria-label="বন্ধ করুন">'+icon('close')+'</button></div>'+body;document.body.append(d);d.addEventListener('close',()=>{d.querySelector('video')?.pause();d.remove();returnFocus?.focus()},{once:true});d.showModal()}
document.addEventListener('click',e=>{const el=e.target.closest('a,button');if(!el)return;
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
  if(el.matches('.navBrand')&&pageState()[0]==='home')window.scrollTo(0,0);if(el.dataset.pane){feedView=el.dataset.pane;document.querySelector('.feedPanel').outerHTML=feedPanel();document.querySelector('.feedTabs [aria-pressed=true]').focus({preventScroll:true});return}if(el.matches('dialog a,[data-close]'))document.querySelector('dialog')?.close();if(el.dataset.tool==='menu')dialog('সব বিভাগ','<div class="menuGrid">'+anchor('home','প্রচ্ছদ')+anchor('latest','সর্বশেষ')+anchor('videos','ভিডিও')+sections.map(s=>anchor('section',s,s)).join('')+'</div>');if(el.dataset.tool==='search')dialog('সংবাদ খুঁজুন','<form data-search><label>শিরোনাম বা বিষয়<input autofocus required type="search" name="term" placeholder="যেমন: ইরান"></label><button>খুঁজুন</button></form>');if(el.dataset.region){region=el.dataset.region;document.querySelector('.world').outerHTML=world();document.querySelector('.tabs [aria-pressed=true]')?.focus({preventScroll:true})}if(el.dataset.filter){showBreaking=el.dataset.filter==='breaking';visibleCount=14;render()}if(el.hasAttribute('data-more')){visibleCount+=14;render()}if(el.dataset.video){const v=videos.find(x=>String(x.id)===el.dataset.video);if(v)dialog(v.title,'<video controls playsinline autoplay poster="'+safe(v.image)+'" src="'+safe(v.url)+'"></video><p>'+safe(v.description)+'</p><a class="more" href="'+safe(v.source)+'" target="_blank" rel="noopener">সূত্র ↗</a>')}});
document.addEventListener('submit',e=>{if(!e.target.matches('[data-search]'))return;e.preventDefault();const q=e.target.term.value.trim();if(q){document.querySelector('dialog')?.close();location.hash=url('search',q)}});
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

window.addEventListener('hashchange', () => {
  document.querySelector('dialog')?.close();
  visibleCount = 14;
  showBreaking = false;
  loadPage();
});
loadPage(true);

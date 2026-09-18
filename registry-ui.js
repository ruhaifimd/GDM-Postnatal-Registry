/* Presentation and accessible interaction layer; registry data stays in index.html. */
(() => {
  const paths = {
    dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    patients:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87',
    bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
    admin:'M3 21h18 M5 21V7l7-4 7 4v14 M9 21v-6h6v6 M9 9h1 M14 9h1',
    edit:'M12 20H4V12 M9 15l1-4L18 3l3 3-8 8z',
    trash:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
    record:'M14 2H5v20h14V7z M14 2v5h5 M8 12h8 M8 16h6',
    chart:'M3 3v18h18 M7 16v-4 M12 16V8 M17 16V5',
    calendar:'M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16',
    search:'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16 M16 16l6 6',
    download:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
    plus:'M12 5v14 M5 12h14',
    lab:'M9 3h6 M10 3v7l-6 10h16l-6-10V3 M8 15h8'
  };
  const icon = name => `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.chart}"/></svg>`;
  const strip = text => text.replace(/[\p{Extended_Pictographic}\uFE0F\u2705\u2B1C]/gu,'').trim();
  const nav = [ ['dashboard','dashboard','Ringkasan'],['linelisting','patients','Pesakit'],['reminder','bell','Susulan'],['admin','admin','Pentadbiran'] ];
  document.querySelector('.nav-tabs').setAttribute('aria-label','Navigasi utama');
  nav.forEach(([id,glyph,label]) => {
    const old = document.getElementById(`tab-${id}`);
    const button = document.createElement('button');
    button.type='button'; button.id=old.id; button.className=old.className;
    button.innerHTML=icon(glyph)+`<span>${label}</span>`;
    const badge=old.querySelector('.badge'); if(badge) button.append(badge);
    button.onclick=()=>showPage(`page-${id}`); old.replaceWith(button);
  });
  const pageDetails = {
    dashboard:['PANTAUAN POSTNATAL','Gambaran keseluruhan','Perkembangan penjagaan ibu, dalam satu paparan.'],
    linelisting:['REKOD & PENJAGAAN','Daftar pesakit','Cari rekod, semak keputusan dan teruskan penjagaan.'],
    reminder:['TINDAKAN SUSULAN','Susulan & temujanji','Utamakan pesakit yang memerlukan tindakan seterusnya.'],
    admin:['PENGURUSAN REGISTRI','Klinik & pasukan','Urus klinik, pegawai bertanggungjawab dan pentadbir.']
  };
  Object.entries(pageDetails).forEach(([id,[eyebrow,title,description]])=>{
    const heading=document.createElement('header'); heading.className='page-heading';
    heading.innerHTML=`<div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>`;
    if(id==='dashboard'||id==='linelisting'){
      const action=document.createElement('button');action.className='btn btn-primary';action.type='button';action.innerHTML=icon('plus')+'Daftar pesakit';action.onclick=()=>openAddPatient();heading.append(action);
    }
    document.getElementById(`page-${id}`).prepend(heading);
  });
  const banner=document.createElement('section');banner.className='overview-banner';banner.setAttribute('aria-label','Liputan OGTT');
  banner.innerHTML='<div><div class="eyebrow">KESINAMBUNGAN PENJAGAAN</div><h2>Liputan saringan postnatal</h2><p id="coverage-copy">Menyediakan ringkasan ujian postnatal…</p></div><div class="overview-metric"><div class="completion-ring"><span id="coverage-value">—</span></div><p><strong>OGTT direkod</strong><br>Daripada semua pesakit berdaftar</p></div>';
  document.querySelector('#page-dashboard .page-heading').after(banner);
  const date=document.createElement('div');date.className='date-label';date.innerHTML=icon('calendar');date.append(document.createTextNode(new Intl.DateTimeFormat('ms-MY',{day:'numeric',month:'long',year:'numeric'}).format(new Date())));document.querySelector('.topbar-right').prepend(date);
  const skip=document.createElement('a');skip.className='skip-link';skip.href='#page-dashboard';skip.textContent='Langkau ke kandungan';document.body.prepend(skip);
  document.querySelectorAll('.page').forEach(page=>page.setAttribute('tabindex','-1'));
  const originalShowPage=window.showPage;
  window.showPage=id=>{originalShowPage(id);nav.forEach(([key])=>document.getElementById(`tab-${key}`).setAttribute('aria-current',id===`page-${key}`?'page':'false'));skip.href=`#${id}`;document.getElementById(id).focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});};
  document.getElementById('tab-dashboard').setAttribute('aria-current','page');
  [['ll-search','Cari nama atau nombor IC'],['ll-klinik','Klinik'],['ll-status','Keputusan OGTT']].forEach(([id,label])=>{
    const field=document.getElementById(id);field.setAttribute('aria-label',label);
    const wrapper=document.createElement('div');const lbl=document.createElement('label');lbl.className='filter-label';lbl.htmlFor=id;lbl.textContent=label;field.before(wrapper);wrapper.append(lbl,field);
  });
  document.getElementById('ll-search').placeholder='Nama atau nombor IC';
  document.querySelectorAll('.form-group').forEach(group=>{const label=group.querySelector('label');const field=group.querySelector('input,select,textarea');if(label&&field?.id)label.htmlFor=field.id;});
  document.getElementById('data-status').setAttribute('aria-label','Status sambungan; muat semula data');
  document.querySelectorAll('.modal-overlay').forEach(overlay=>{const dialog=overlay.querySelector('.modal');dialog?.setAttribute('role','dialog');dialog?.setAttribute('aria-modal','true');const title=overlay.querySelector('.modal-title');if(title){title.id=title.id||`${overlay.id}-title`;dialog?.setAttribute('aria-labelledby',title.id);}});
  let previousFocus=null;
  const enhance=()=>{
    document.querySelectorAll('.card-title,.modal-title,.rs-hdr,.sec-ttl,.btn,.btn-icon,.empty .eico').forEach(el=>{
      const raw=el.textContent.trim();
      if(el.dataset.refined && !/[\p{Extended_Pictographic}\u2705]/u.test(raw))return;
      if(raw==='✕')el.setAttribute('aria-label','Tutup');
      if(raw==='←')el.setAttribute('aria-label','Kembali ke senarai');
      let name=raw.includes('🗑')?'trash':raw.includes('✏')?'edit':raw.includes('⬇')?'download':raw.includes('🔍')?'search':raw.includes('📅')?'calendar':raw.includes('👤')?'patients':raw.includes('🏥')?'admin':raw.includes('🧪')||raw.includes('🔬')?'lab':raw.includes('📋')?'record':'chart';
      const hasEmoji=/[\p{Extended_Pictographic}\u2705]/u.test(raw);
      if(hasEmoji){Array.from(el.childNodes).filter(node=>node.nodeType===3).forEach(node=>node.textContent=strip(node.textContent));
        if(!el.querySelector('.ui-icon') && !el.classList.contains('rs-hdr'))el.insertAdjacentHTML('afterbegin',icon(name));
        if(!strip(raw)){el.setAttribute('aria-label',el.title||({trash:'Padam rekod',edit:'Kemaskini',record:'Buka rekod'}[name])||'Lihat');}
      }
      el.dataset.refined='true';
    });
    const labels=['','Nama / No. IC','Klinik','Tarikh bersalin','Sasaran OGTT','Keputusan OGTT','Ujian 2027','Tindakan'];
    document.querySelectorAll('#ll-tbody tr').forEach(row=>Array.from(row.cells).forEach((cell,i)=>{if(!cell.dataset.label)cell.dataset.label=labels[i]||'';}));
    const total=Number(document.getElementById('kpi-total').textContent),pending=Number(document.getElementById('kpi-pendogtt').textContent);
    if(Number.isFinite(total)&&Number.isFinite(pending)){
      const completed=total-pending,percent=total?Math.round(completed/total*100):0;
      const value=`${percent}%`,copy=`${completed} daripada ${total} pesakit mempunyai keputusan OGTT postnatal.`;
      if(document.getElementById('coverage-value').textContent!==value){document.getElementById('coverage-value').textContent=value;document.querySelector('.completion-ring').style.setProperty('--completion',value);}
      if(document.getElementById('coverage-copy').textContent!==copy)document.getElementById('coverage-copy').textContent=copy;
    }
    const open=document.querySelector('.modal-overlay.open');
    if(open&&!open.dataset.focused){previousFocus=document.activeElement;open.dataset.focused='true';(open.querySelector('input:not([type=hidden]),select,textarea,button'))?.focus();}
    document.querySelectorAll('.modal-overlay[data-focused]:not(.open)').forEach(el=>{delete el.dataset.focused;if(previousFocus?.isConnected)previousFocus.focus();});
    document.body.style.overflow=document.querySelector('.modal-overlay.open,.detail-overlay.open')?'hidden':'';
  };
  let queued=false;
  new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;enhance();});}}).observe(document.getElementById('app'),{childList:true,subtree:true});
  document.querySelectorAll('.modal-overlay,.detail-overlay').forEach(el=>new MutationObserver(enhance).observe(el,{attributes:true,attributeFilter:['class']}));
  document.addEventListener('keydown',event=>{
    const overlay=document.querySelector('.modal-overlay.open');
    if(!overlay)return;
    if(event.key==='Escape'){window.closeModal(overlay.id);event.preventDefault();}
    if(event.key==='Tab'){const items=Array.from(overlay.querySelectorAll('button,input,select,textarea,[tabindex="0"]')).filter(el=>!el.disabled&&el.getClientRects().length);const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){last?.focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===last){first?.focus();event.preventDefault();}}
  });
  enhance();
})();

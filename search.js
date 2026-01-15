const SITE_PAGES = [
  {url:'index.html', title:'Home', text: 'This is the site home. Use the links below to open each page. To edit a page, open the corresponding HTML file in the project.'},
  {url:'introduction.html', title:'Introduction', text: 'Welcome to your new wiki home page. Edit this file (introduction.html) to change content, add sections, or adjust styling.'},
  {url:'notes.html', title:'Notes', text: 'Antibiotiques. Use this area for short notes. To create links between pages, use standard links.'},
  {url:'about.html', title:'About', text: 'Light, white/beige styled page designed to be edited directly in code to avoid runtime bugs.'}
]

function normalize(s){return (s||'').toString().toLowerCase()}

function searchPages(q){
  if(!q) return []
  const qn = normalize(q)
  return SITE_PAGES.map(p=>{
    const title = normalize(p.title)
    const text = normalize(p.text)
    let score = 0
    if(title.includes(qn)) score += 10
    if(text.includes(qn)) score += 5
    return {...p, score}
  }).filter(p=>p.score>0).sort((a,b)=>b.score-a.score)
}

function renderResults(results, container){
  container.innerHTML = ''
  if(!results.length){ container.style.display = 'none'; return }
  results.forEach(r=>{
    const a = document.createElement('a')
    a.href = r.url
    a.innerHTML = `<strong>${r.title}</strong><div style="font-size:12px;color:#6b6b6b">${escapeHtml(snippet(r.text))}</div>`
    container.appendChild(a)
  })
  container.style.display = 'block'
}

function snippet(text){
  if(!text) return ''
  return text.length>140? text.slice(0,137)+'...': text
}

function escapeHtml(str){
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

// wire inputs on pages
window.addEventListener('DOMContentLoaded', ()=>{
  const inputs = document.querySelectorAll('.search-bar input#siteSearch')
  inputs.forEach(input=>{
    const results = input.parentElement.querySelector('#searchResults')
    input.addEventListener('input', (e)=>{
      const q = e.target.value.trim()
      const r = searchPages(q)
      renderResults(r, results)
    })
    // hide when clicking outside
    document.addEventListener('click', (ev)=>{
      if(!input.parentElement.contains(ev.target)) results.style.display = 'none'
    })
    // enter key navigate to first
    input.addEventListener('keydown', (ev)=>{
      if(ev.key === 'Enter'){
        const r = searchPages(input.value.trim())
        if(r.length) window.location.href = r[0].url
+      }
    })
  })
})

/* ===== PUFFESTERS – script.js ===== */
const MENU = [
  {id:1,name:"Ceremonial Matcha Latte",cat:"Matcha",price:650,pic:"🍵"},
  {id:2,name:"Strawberry Matcha",cat:"Matcha",price:750,pic:"🍓"},
  {id:3,name:"Matcha Soft Serve",cat:"Matcha",price:600,pic:"🍦"},
  {id:4,name:"Iced Caramel Latte",cat:"Coffee",price:700,pic:"🧋"},
  {id:5,name:"Hot Cappuccino",cat:"Coffee",price:550,pic:"☕"},
  {id:6,name:"Pink Rose Latte",cat:"Coffee",price:720,pic:"🌸"},
  {id:7,name:"Strawberry Puff",cat:"Desserts",price:450,pic:"🍰"},
  {id:8,name:"Pistachio Cupcake",cat:"Desserts",price:400,pic:"🧁"},
  {id:9,name:"Choco Chip Cookie",cat:"Desserts",price:300,pic:"🍪"},
  {id:10,name:"Matcha Tiramisu",cat:"Desserts",price:800,pic:"🍮"}
];
const WORKSHOPS = [
  {name:"Bedazzling Mugs",pic:"💎",price:2500,time:"Sat 4:00 PM, 2 hrs",desc:"Stick gems, pearls and glitter onto your own mug."},
  {name:"Painting Tote Bags",pic:"🎨",price:2000,time:"Sun 3:00 PM, 2 hrs",desc:"Paint a pastel design on a canvas tote to take home."},
  {name:"Cookie Decorating",pic:"🍪",price:1800,time:"Fri 6:00 PM, 1.5 hrs",desc:"Pipe icing and sprinkles onto six cute cookies."},
  {name:"Latte Art 101",pic:"🫖",price:2200,time:"Wed 5:00 PM, 1.5 hrs",desc:"Learn to pour hearts and tulips like a barista."}
];
const $ = (s, r = document) => r.querySelector(s);
const money = n => "Rs " + n.toLocaleString();
const page = document.body.dataset.page;

/* ---------- Header, footer, cart drawer (shared by all pages) ---------- */
const links = [["index.html","home","Home"],["about.html","about","About"],["order.html","order","Order"],["workshops.html","workshops","Workshops"],["contact.html","contact","Contact"]];
document.body.insertAdjacentHTML("afterbegin",
  `<header><a class="logo" href="index.html">🍵 Puffesters</a>
   <nav>${links.map(l=>`<a href="${l[0]}" class="${l[1]===page?"active":""}">${l[2]}</a>`).join("")}</nav>
   <button class="btn small" id="cart-btn">🧺 Basket (<span id="count">0</span>)</button></header>`);
document.body.insertAdjacentHTML("beforeend",
  `<footer>Made with 💚 and 💗 · Puffesters © 2026 </footer>
   <aside id="drawer" aria-label="Basket">
     <button class="btn small" id="close">✕ Close</button>
     <h2 style="margin-top:1rem">Your basket</h2>
     <div id="items"></div><div class="total" id="total"></div>
     <form id="checkout" class="box hidden">
       <label>Name<input name="name" required></label>
       <label>Phone<input name="phone" required></label>
       <label>Pickup or delivery<select name="type"><option>Pickup</option><option>Delivery</option></select></label>
       <label>Address / notes<input name="note"></label>
       <button class="btn green" type="submit">Place order</button>
     </form>
     <div class="note hidden" id="done"></div>
   </aside><div id="toast"></div>`);

/* ---------- Cart (saved in the browser with localStorage) ---------- */
let cart = JSON.parse(localStorage.getItem("puff-cart") || "{}");
const save = () => localStorage.setItem("puff-cart", JSON.stringify(cart));
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}
function addToCart(id){cart[id]=(cart[id]||0)+1;save();renderCart();toast("Added to basket 🧺")}
function change(id,d){cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];save();renderCart()}
function renderCart(){
  const ids = Object.keys(cart); let total = 0, count = 0;
  $("#items").innerHTML = ids.length ? ids.map(id=>{
    const m = MENU.find(x=>x.id==id); total += m.price*cart[id]; count += cart[id];
    return `<div class="cart-item"><span>${m.pic}</span><span>${m.name}<br><small>${money(m.price)}</small></span>
      <button class="qty" onclick="change(${id},-1)">−</button><b>${cart[id]}</b><button class="qty" onclick="change(${id},1)">+</button></div>`;
  }).join("") : "<p>Your basket is empty. Go add something yummy! 🍓</p>";
  $("#total").textContent = ids.length ? "Total: " + money(total) : "";
  $("#checkout").classList.toggle("hidden", !ids.length);
  $("#count").textContent = count;
}
$("#cart-btn").onclick = () => { $("#done").classList.add("hidden"); $("#drawer").classList.add("open"); };
$("#close").onclick = () => $("#drawer").classList.remove("open");
$("#checkout").onsubmit = e => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  const orderNo = "PUFF-" + Math.floor(1000 + Math.random()*9000);
  const orders = JSON.parse(localStorage.getItem("puff-orders") || "[]");
  orders.push({orderNo, ...f, cart, time:new Date().toISOString()});
  localStorage.setItem("puff-orders", JSON.stringify(orders));   // "submitted" order saved
  cart = {}; save(); renderCart(); e.target.reset();
  const d = $("#done"); d.textContent = `🎉 Thank you, ${f.name}! Order ${orderNo} is placed. We'll call you on ${f.phone}.`; d.classList.remove("hidden");
};

/* ---------- Menu card HTML ---------- */
const cardHTML = m => `<div class="card tilt"><div class="pic">${m.pic}</div><span class="tag">${m.cat}</span>
  <h3>${m.name}</h3><div class="row"><span class="price">${money(m.price)}</span>
  <button class="btn small green" onclick="addToCart(${m.id})">Add +</button></div></div>`;

/* ---------- Home: featured ---------- */
if ($("#featured")) $("#featured").innerHTML = [1,6,7,10].map(i=>cardHTML(MENU.find(m=>m.id===i))).join("");

/* ---------- Order page: search, filter, sort ---------- */
if ($("#menu")) {
  let cat = "All";
  const cats = ["All", ...new Set(MENU.map(m=>m.cat))];
  $("#chips").innerHTML = cats.map(c=>`<button class="chip ${c==="All"?"on":""}">${c}</button>`).join("");
  function show(){
    const q = $("#search").value.toLowerCase(), s = $("#sort").value;
    let list = MENU.filter(m => (cat==="All"||m.cat===cat) && (m.name+m.cat).toLowerCase().includes(q));
    if (s==="low") list.sort((a,b)=>a.price-b.price); if (s==="high") list.sort((a,b)=>b.price-a.price);
    $("#menu").innerHTML = list.map(cardHTML).join("");
    $("#empty").classList.toggle("hidden", list.length>0);
    tilt();
  }
  $("#chips").onclick = e => { if(!e.target.matches(".chip"))return; cat=e.target.textContent;
    document.querySelectorAll(".chip").forEach(c=>c.classList.toggle("on",c===e.target)); show(); };
  $("#search").oninput = show; $("#sort").onchange = show; show();
}

/* ---------- Workshops page + contact dropdown ---------- */
if ($("#workshops")) $("#workshops").innerHTML = WORKSHOPS.map((w,i)=>`<div class="card tilt ${i%2?"pink":""}">
  <div class="pic">${w.pic}</div><h3>${w.name}</h3><p>${w.desc}</p><p>🕒 ${w.time}</p>
  <div class="row"><span class="price">${money(w.price)}</span>
  <a class="btn small green" href="contact.html?w=${encodeURIComponent(w.name)}">Apply</a></div></div>`).join("");

if ($("#wsel")) {
  $("#wsel").innerHTML = WORKSHOPS.map(w=>`<option>${w.name}</option>`).join("");
  const pick = new URLSearchParams(location.search).get("w"); if (pick) $("#wsel").value = pick;
  $("#apply").onsubmit = e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const apps = JSON.parse(localStorage.getItem("puff-apps") || "[]"); apps.push(f);
    localStorage.setItem("puff-apps", JSON.stringify(apps));
    const t = $("#thanks"); t.textContent = `💌 Thanks ${f.name}! We got your request for ${f.workshop} on ${f.date}. We'll reach out soon.`;
    t.classList.remove("hidden"); e.target.reset();
  };
}

/* ---------- 3D tilt effect on cards ---------- */
function tilt(){
  document.querySelectorAll(".tilt").forEach(c=>{
    c.onmousemove = e => { const r=c.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      c.style.transform=`rotateY(${x*14}deg) rotateX(${-y*14}deg) translateY(-4px)`; };
    c.onmouseleave = () => c.style.transform = "";
  });
}
tilt(); renderCart();

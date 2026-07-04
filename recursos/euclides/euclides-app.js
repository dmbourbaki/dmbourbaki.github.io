// ============================================================
// © 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.
// Colección: Otros Simuladores (Historia de las Matemáticas)
// https://dmbourbaki.github.io/
// Queda prohibida la reproducción, distribución o modificación total
// o parcial de este código sin autorización previa y por escrito del
// autor. Contacto: dmbourbaki@gmail.com
// ============================================================

// ============================================================
// MOTOR DE CONSTRUCCION - Elementos de Euclides, Libro I (I.1-I.10)
// Geometria analitica validada (test_geometria.js + validacion de recetas.js)
// Camara mundo<->pantalla, herramientas tipo GeoGebra, demostracion fragmentada
// con resaltado sincronizado, y automatizacion a 3 velocidades.
// ============================================================

const canvas = document.getElementById('lienzo');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// ---------- geometria analitica ----------
function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }

function interseccionCirculoCirculo(c1,r1,c2,r2){
  const dx=c2.x-c1.x, dy=c2.y-c1.y;
  const d=Math.hypot(dx,dy);
  if(d>r1+r2+1e-9 || d<Math.abs(r1-r2)-1e-9 || d<1e-9) return [];
  const a=(r1*r1-r2*r2+d*d)/(2*d);
  const h=Math.sqrt(Math.max(r1*r1-a*a,0));
  const xm=c1.x+a*dx/d, ym=c1.y+a*dy/d;
  const pts=[{x:xm+h*dy/d, y:ym-h*dx/d}];
  if(h>1e-9) pts.push({x:xm-h*dy/d, y:ym+h*dx/d});
  return pts;
}
function interseccionRectaCirculo(p1,p2,centro,r){
  const dx=p2.x-p1.x, dy=p2.y-p1.y;
  const fx=p1.x-centro.x, fy=p1.y-centro.y;
  const a=dx*dx+dy*dy, b=2*(fx*dx+fy*dy), c=fx*fx+fy*fy-r*r;
  const disc=b*b-4*a*c;
  if(disc<-1e-9) return [];
  const dd=Math.sqrt(Math.max(disc,0));
  const t1=(-b-dd)/(2*a), t2=(-b+dd)/(2*a);
  const pts=[{x:p1.x+t1*dx,y:p1.y+t1*dy}];
  if(Math.abs(disc)>1e-9) pts.push({x:p1.x+t2*dx,y:p1.y+t2*dy});
  return pts;
}
function interseccionRectaRecta(p1,p2,p3,p4){
  const x1=p1.x,y1=p1.y,x2=p2.x,y2=p2.y,x3=p3.x,y3=p3.y,x4=p4.x,y4=p4.y;
  const den=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
  if(Math.abs(den)<1e-9) return null;
  const t=((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/den;
  return {x:x1+t*(x2-x1), y:y1+t*(y2-y1)};
}
function masAlla(origen, pasaPor, candidatos){
  const dx=pasaPor.x-origen.x, dy=pasaPor.y-origen.y;
  let mejor=null, mejorT=-Infinity;
  for(const p of candidatos){
    const t=(p.x-origen.x)*dx+(p.y-origen.y)*dy;
    if(t>mejorT){mejorT=t; mejor=p;}
  }
  return mejor;
}
function lejanaDe(ref, candidatos){
  return candidatos.reduce((a,b)=> dist(a,ref)>dist(b,ref)?a:b);
}
function entreSegmento(p1,p2,candidatos){
  const dx=p2.x-p1.x, dy=p2.y-p1.y, len2=dx*dx+dy*dy;
  let mejor=null, mejorScore=Infinity;
  for(const p of candidatos){
    const t=((p.x-p1.x)*dx+(p.y-p1.y)*dy)/len2;
    if(t>=-0.02 && t<=1.02){
      const score=Math.abs(t-0.5);
      if(score<mejorScore){ mejorScore=score; mejor=p; }
    }
  }
  return mejor;
}

// ---------- camara: espacio del mundo <-> espacio de pantalla ----------
const camara = { x:0, y:0, escala:1 };

function mundoAPantalla(p){
  return { x: (p.x-camara.x)*camara.escala + W/2, y: (p.y-camara.y)*camara.escala + H/2 };
}
function pantallaAMundo(p){
  return { x: (p.x-W/2)/camara.escala + camara.x, y: (p.y-H/2)/camara.escala + camara.y };
}
function encuadrar(puntosMundo, margenFrac=0.22){
  const xs = puntosMundo.map(p=>p.x), ys = puntosMundo.map(p=>p.y);
  const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
  const anchoM = Math.max(maxX-minX, 60), altoM = Math.max(maxY-minY, 60);
  const cx = (minX+maxX)/2, cy=(minY+maxY)/2;
  const escalaX = W/(anchoM*(1+margenFrac*2));
  const escalaY = H/(altoM*(1+margenFrac*2));
  camara.escala = Math.min(escalaX, escalaY, 1.6);
  camara.x = cx; camara.y = cy;
}

// ---------- estado ----------
let propActual = 1;
let puntos = {};
let objetos = {};
let pasoIdx = 0;
let herramientaActiva = null;
let primerPunto = null;
let mouseP = {x:-9999,y:-9999};
let mouseM = {x:-9999,y:-9999};
let pistaActiva = false;
let arrastrandoCamara = false;
let ultimoArrastre = null;
let progresoSuperposicion = 0;
let animandoSuperposicion = false;
let faseActual = 'construccion'; // 'construccion' | 'demostracion'
let demoIdx = 0;
let clausulaActivaResaltado = null; // resaltado geometrico vinculado a la clausula de texto activa
let automatizando = false;
let automatizarTimer = null;
const VELOCIDADES = { lenta: 1900, media: 950, rapida: 380 };
let velocidadActual = 'media';

const RADIO_PUNTO_PANT = 5;
const TOLERANCIA_CLIC_PANT = 18;

// ---------- sonido sencillo: tonos breves generados con Web Audio API, sin archivos externos ----------
let sonidoActivado = true;
let contextoAudio = null;
function obtenerContextoAudio(){
  if(!contextoAudio){
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    contextoAudio = new AC();
  }
  if(contextoAudio.state === 'suspended') contextoAudio.resume();
  return contextoAudio;
}
function tono(frecuencia, duracionMs, tipoOnda, volumenPico){
  if(!sonidoActivado) return;
  const ctxAudio = obtenerContextoAudio();
  if(!ctxAudio) return;
  const osc = ctxAudio.createOscillator();
  const gain = ctxAudio.createGain();
  osc.type = tipoOnda || 'sine';
  osc.frequency.value = frecuencia;
  const ahora = ctxAudio.currentTime;
  gain.gain.setValueAtTime(0, ahora);
  gain.gain.linearRampToValueAtTime(volumenPico||0.08, ahora+0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ahora+duracionMs/1000);
  osc.connect(gain); gain.connect(ctxAudio.destination);
  osc.start(ahora); osc.stop(ahora+duracionMs/1000+0.02);
}
function sonidoAcierto(){ tono(740, 110, 'sine', 0.07); }
function sonidoError(){ tono(180, 130, 'sine', 0.05); }
function sonidoConstruccionCompleta(){
  // un pequeño arpegio ascendente de 3 notas, breve y discreto
  tono(523.25, 130, 'sine', 0.06);
  setTimeout(()=>tono(659.25, 130, 'sine', 0.06), 90);
  setTimeout(()=>tono(784.0, 180, 'sine', 0.07), 180);
}

const COLOR = {
  trazo: '#5c5240', trazoFuerte:'#2a2117', trazoTenue:'rgba(92,82,64,.30)',
  activo: '#a3322e', activoSuave:'rgba(163,50,46,.45)',
  exito: '#2d5a4a', exitoSuave:'rgba(45,90,74,.5)',
  preview: '#a3322e',
  // categorías de resaltado geométrico: cada tipo de objeto, su propio pigmento
  segmento: '#a3322e',           // lacre — segmentos individuales
  triangulo: '#2a5d8c',          // lapislázuli — triángulos completos
  trianguloRelleno: 'rgba(42,93,140,.08)',
  angulo: '#b8742a',             // ámbar — ángulos
  circuloResaltado: '#7a3d6e',   // púrpura — circunferencias citadas
};

// ---------- carga de proposicion ----------
function cargarProposicion(n){
  propActual = n;
  const r = RECETAS[n];
  puntos = {};
  objetos = {};
  pasoIdx = 0;
  demoIdx = 0;
  primerPunto = null;
  herramientaActiva = null;
  pistaActiva = false;
  progresoSuperposicion = 0;
  animandoSuperposicion = false;
  detenerAutomatizacion();

  document.getElementById('prop-numero').textContent = "Proposición " + r.numeroRomano;
  const etiquetaTipo = document.getElementById('prop-tipo-etiqueta');
  if(r.tipo==='construccion'){
    etiquetaTipo.textContent = '⚒ construcción';
    etiquetaTipo.className = 'prop-tipo-etiqueta tipo-construccion';
  } else {
    etiquetaTipo.textContent = '∴ teorema';
    etiquetaTipo.className = 'prop-tipo-etiqueta tipo-demostracion';
  }
  document.getElementById('prop-titulo').textContent = r.titulo;
  document.getElementById('prop-enunciado').innerHTML = formatearTexto(r.enunciado);
  document.querySelectorAll('.btn-prop').forEach(b=>b.classList.toggle('activo', +b.dataset.prop===n));

  const panelHerramientas = document.getElementById('barra-herramientas');
  const menuAuto = document.getElementById('menu-automatizar');
  const verifCont = document.getElementById('verificacion');
  const panelDemo = document.getElementById('panel-demostracion');
  verifCont.style.display='none'; verifCont.innerHTML='';
  panelDemo.style.display = 'none';

  if(r.tipo === 'demostracion'){
    faseActual = 'demostracion';
    for(const id in r.figuraInicial) puntos[id] = {...r.figuraInicial[id]};
    (r.segmentosInicial||[]).forEach((s,i)=>{
      objetos['seg'+i] = { tipo:'segmento', p1:puntos[s.de], p2:puntos[s.a] };
    });
    panelHerramientas.style.display = 'none';
    menuAuto.style.display = '';
    document.getElementById('lista-pasos').innerHTML = '<p class="nota-sin-pasos">Esta proposición es un teorema: no requiere trazos nuevos, solo razonamiento sobre la figura dada.</p>';
    document.getElementById('estado-texto').textContent = "Teorema — usa Automatizar o el botón de abajo para ver la demostración.";
    document.getElementById('btn-paso-anterior').disabled = true;
    document.getElementById('btn-paso-siguiente').disabled = true;
    encuadrar(Object.values(puntos));
    if(r.esIgualdadDeAreas || r.esDobleDeArea) mostrarVerificacion();
    mostrarPanelDemostracion();
  } else {
    faseActual = 'construccion';
    for(const id in r.puntosDados) puntos[id] = {...r.puntosDados[id]};
    (r.segmentosDados||[]).forEach(s=>{
      objetos[s.id] = { tipo:'segmento', p1:puntos[s.de], p2:puntos[s.a] };
    });
    panelHerramientas.style.display = '';
    menuAuto.style.display = '';
    encuadrar(estimarRangoFinal(r));
    actualizarBarraHerramientas();
    renderListaPasos();
    actualizarBarraEstado();
  }
  dibujar();
}

function formatearTexto(s){
  // quita los marcadores [[ID]] usados para vincular resaltado, dejando solo el texto visible
  return s.replace(/\[\[([^\]]+)\]\]/g, '$1');
}

function estimarRangoFinal(receta){
  const p = {}; for(const id in receta.puntosDados) p[id]={...receta.puntosDados[id]};
  const o = {};
  (receta.segmentosDados||[]).forEach(s=> o[s.id]={tipo:'segmento',p1:p[s.de],p2:p[s.a]});
  for(const paso of receta.pasos){
    try{ resolverPasoEn(paso, p, o); }catch(e){ /* si un paso aun no resuelve, seguimos con lo que hay */ }
  }
  return Object.values(p);
}

// resuelve un paso de la receta (generico) escribiendo en p (puntos) y o (objetos)
function resolverPasoEn(paso, p, o){
  if(paso.tipo==='circulo'){
    const radio = paso.radioEntre
      ? dist(p[paso.radioEntre[0]], p[paso.radioEntre[1]])
      : dist(p[paso.centro], p[paso.radioHasta]);
    o[paso.id] = { tipo:'circulo', centro:p[paso.centro], radio };
  } else if(paso.tipo==='recta' || paso.tipo==='segmento'){
    o[paso.id] = { tipo:paso.tipo, p1:p[paso.de], p2:p[paso.a], extender:!!paso.extender };
  } else if(paso.tipo==='puntoEnSegmento'){
    const p1=p[paso.de], p2=p[paso.a];
    p[paso.id] = { x:p1.x+(p2.x-p1.x)*paso.fraccion, y:p1.y+(p2.y-p1.y)*paso.fraccion };
  } else if(paso.tipo==='interseccion'){
    const r = resolverInterseccionEn(paso, o, p);
    if(!r) throw new Error('Interseccion nula en paso '+paso.id);
    p[paso.id] = r;
  }
}

function resolverInterseccionEn(paso, objetosRef, puntosRef){
  const get = (id) => objetosRef[id];
  function comoCirculo(o){ return o && o.tipo==='circulo' ? o : null; }
  function comoRecta(o){ return o && (o.tipo==='recta'||o.tipo==='segmento') ? o : null; }

  const c1 = comoCirculo(get(paso.obj1)), c2 = comoCirculo(get(paso.obj2));
  const l1 = comoRecta(get(paso.obj1)), l2 = comoRecta(get(paso.obj2));

  let candidatos = [];
  if(c1 && c2){
    candidatos = interseccionCirculoCirculo(c1.centro, c1.radio, c2.centro, c2.radio);
  } else if(c1 && l2){
    candidatos = interseccionRectaCirculo(l2.p1, l2.p2, c1.centro, c1.radio);
  } else if(l1 && c2){
    candidatos = interseccionRectaCirculo(l1.p1, l1.p2, c2.centro, c2.radio);
  } else if(l1 && l2){
    const r = interseccionRectaRecta(l1.p1, l1.p2, l2.p1, l2.p2);
    candidatos = r ? [r] : [];
  }

  if(candidatos.length===0) return null;
  if(candidatos.length===1) return candidatos[0];

  if(paso.cual==="arriba") return candidatos.reduce((a,b)=> a.y<b.y?a:b);
  if(paso.cual==="abajo") return candidatos.reduce((a,b)=> a.y>b.y?a:b);
  if(paso.cual==="izquierda") return candidatos.reduce((a,b)=> a.x<b.x?a:b);
  if(paso.cual==="derecha") return candidatos.reduce((a,b)=> a.x>b.x?a:b);
  if(paso.cual.startsWith("masAlla:")){
    const [origenId, refId] = paso.cual.split(":")[1].split(",");
    const origen = puntosRef[origenId] || objetosRef[origenId];
    const ref = puntosRef[refId] || objetosRef[refId];
    return masAlla(origen, ref, candidatos);
  }
  if(paso.cual.startsWith("lejana:")){
    const refId = paso.cual.split(":")[1];
    const ref = puntosRef[refId] || objetosRef[refId];
    return lejanaDe(ref, candidatos);
  }
  if(paso.cual.startsWith("entre:")){
    const [p1id, p2id] = paso.cual.split(":")[1].split(",");
    return entreSegmento(puntosRef[p1id], puntosRef[p2id], candidatos);
  }
  return candidatos[0];
}
function resolverInterseccion(paso){ return resolverInterseccionEn(paso, objetos, puntos); }

function pasoActual(){
  const r = RECETAS[propActual];
  if(!r.pasos || faseActual!=='construccion') return null;
  const p = r.pasos[pasoIdx];
  return (p && p.tipo!=='fin') ? p : null;
}

function actualizarBarraHerramientas(){
  const paso = pasoActual();
  const requerida = paso ? paso.herramienta : null;
  document.querySelectorAll('.herr').forEach(b=>{
    const esta = b.dataset.herr;
    b.disabled = requerida ? (esta!==requerida) : true;
  });
  herramientaActiva = requerida || null;
  primerPunto = null;
  document.querySelectorAll('.herr').forEach(b=>b.classList.toggle('activa', b.dataset.herr===requerida));
}

document.querySelectorAll('.herr').forEach(b=>{
  b.addEventListener('click', ()=>{
    if(b.disabled) return;
    herramientaActiva = b.dataset.herr;
    primerPunto = null;
    document.querySelectorAll('.herr').forEach(x=>x.classList.toggle('activa', x===b));
    dibujar();
  });
});

const ICONO_HERR = { punto:'\u2022', recta:'\u2571', segmento:'\u2014', circulo:'\u25CB' };

function renderListaPasos(){
  const cont = document.getElementById('lista-pasos');
  cont.innerHTML = '';
  RECETAS[propActual].pasos.forEach((p,i)=>{
    const div = document.createElement('div');
    div.className = 'paso' + (i<pasoIdx?' hecho':'') + (i===pasoIdx && faseActual==='construccion'?' actual':'') + (i>pasoIdx?' futuro':'') + ' navegable';
    const icono = p.herramienta ? `<span class="paso-icono">${ICONO_HERR[p.herramienta]}</span>` : '';
    div.innerHTML = `<span class="num">${i+1}.</span>${icono}<span>${formatearTexto(p.instruccion)}</span>`;
    div.addEventListener('click', ()=> irAPaso(i));
    cont.appendChild(div);
  });
}

// Reconstruye el estado real (puntos, objetos) desde el principio hasta justo ANTES del paso `n`,
// permitiendo retroceder o re-avanzar la construccion sin perder la posibilidad de seguir despues.
function irAPaso(n){
  if(automatizando) detenerAutomatizacion();
  const r = RECETAS[propActual];
  puntos = {};
  objetos = {};
  for(const id in r.puntosDados) puntos[id] = {...r.puntosDados[id]};
  (r.segmentosDados||[]).forEach(s=>{
    objetos[s.id] = { tipo:'segmento', p1:puntos[s.de], p2:puntos[s.a] };
  });
  for(let i=0; i<n; i++){
    resolverPasoEn(r.pasos[i], puntos, objetos);
  }
  pasoIdx = n;
  primerPunto = null;
  pistaActiva = false;
  const verifCont = document.getElementById('verificacion');
  verifCont.style.display='none'; verifCont.innerHTML='';
  document.getElementById('panel-demostracion').style.display = 'none';
  actualizarBarraHerramientas();
  renderListaPasos();
  actualizarBarraEstado();
  if(!pasoActual()){ mostrarVerificacion(); mostrarPanelDemostracion(); sonidoConstruccionCompleta(); }
  dibujar();
}

function actualizarBarraEstado(){
  const el = document.getElementById('estado-texto');
  const btnAnterior = document.getElementById('btn-paso-anterior');
  const btnSiguiente = document.getElementById('btn-paso-siguiente');
  const p = pasoActual();
  if(faseActual!=='construccion'){
    btnAnterior.disabled = true; btnSiguiente.disabled = true;
  } else {
    btnAnterior.disabled = (pasoIdx===0);
    btnSiguiente.disabled = !p;
  }
  if(!p){
    if(faseActual==='construccion') el.textContent = "Construcción completa — revisa la verificación, luego la demostración.";
    el.className='acierto';
    return;
  }
  el.className = '';
  el.textContent = formatearTexto(p.instruccion);
}

// ---------- interaccion: camara (rueda = zoom, arrastrar el fondo = pan) ----------
canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  const antes = pantallaAMundo(mouseP);
  const factor = Math.exp(-e.deltaY*0.0012);
  camara.escala = Math.max(0.18, Math.min(5, camara.escala*factor));
  const despues = pantallaAMundo(mouseP);
  camara.x += antes.x - despues.x;
  camara.y += antes.y - despues.y;
  dibujar();
}, { passive:false });

function zoomCentrado(factor){
  const centroPant = { x: W/2, y: H/2 };
  const antes = pantallaAMundo(centroPant);
  camara.escala = Math.max(0.18, Math.min(5, camara.escala*factor));
  const despues = pantallaAMundo(centroPant);
  camara.x += antes.x - despues.x;
  camara.y += antes.y - despues.y;
  dibujar();
}
document.getElementById('btn-zoom-mas').addEventListener('click', ()=> zoomCentrado(1.25));
document.getElementById('btn-zoom-menos').addEventListener('click', ()=> zoomCentrado(0.8));

function posAdeCliente(e){
  const r = canvas.getBoundingClientRect();
  return { x:(e.clientX-r.left)*(W/r.width), y:(e.clientY-r.top)*(H/r.height) };
}

function puntoCercanoPantalla(posPant, excluir){
  let mejor=null, mejorD=TOLERANCIA_CLIC_PANT;
  for(const id in puntos){
    if(excluir && excluir.includes(id)) continue;
    const pp = mundoAPantalla(puntos[id]);
    const d = dist(posPant, pp);
    if(d<mejorD){ mejorD=d; mejor=id; }
  }
  return mejor;
}

canvas.addEventListener('mousemove', e=>{
  mouseP = posAdeCliente(e);
  mouseM = pantallaAMundo(mouseP);
  if(arrastrandoCamara && ultimoArrastre){
    const dx = (mouseP.x-ultimoArrastre.x)/camara.escala;
    const dy = (mouseP.y-ultimoArrastre.y)/camara.escala;
    camara.x -= dx; camara.y -= dy;
    ultimoArrastre = mouseP;
  }
  dibujar();
});
canvas.addEventListener('mouseleave', ()=>{ mouseP={x:-9999,y:-9999}; arrastrandoCamara=false; dibujar(); });

let posMousedown = null;
canvas.addEventListener('mousedown', e=>{
  posMousedown = posAdeCliente(e);
  const sobrePunto = puntoCercanoPantalla(posMousedown);
  const construccionEnCurso = !!primerPunto || (herramientaActiva==='punto');
  if(!sobrePunto && !construccionEnCurso){
    arrastrandoCamara = true;
    ultimoArrastre = posMousedown;
    canvas.classList.add('agarrando');
  }
});
window.addEventListener('mouseup', ()=>{
  arrastrandoCamara = false;
  canvas.classList.remove('agarrando');
});

canvas.addEventListener('click', e=>{
  if(automatizando) return; // no interferir mientras se autoejecuta
  const posPant = posAdeCliente(e);
  if(posMousedown && dist(posMousedown,posPant) > 6) return; // fue un pan, no un clic de construccion
  const paso = pasoActual();
  if(!paso || faseActual!=='construccion') return;
  ejecutarClicConstruccion(paso, posPant);
});

function ejecutarClicConstruccion(paso, posPant){
  if(herramientaActiva==='punto' && paso.tipo==='interseccion'){
    const real = resolverInterseccion(paso);
    if(real && dist(posPant, mundoAPantalla(real)) < TOLERANCIA_CLIC_PANT+6){
      puntos[paso.id] = real;
      flash(true);
      avanzarPaso();
    } else flash(false);
    dibujar(); return;
  }

  const idClic = puntoCercanoPantalla(posPant, primerPunto?[primerPunto]:null);

  if(!primerPunto){
    const objetivo1 = (paso.tipo==='circulo') ? paso.centro : paso.de;
    if(idClic===objetivo1){ primerPunto = idClic; flash(null); }
    else if(idClic) flash(false);
    dibujar(); return;
  }

  const objetivo2 = (paso.tipo==='circulo') ? (paso.radioHasta || paso.radioEntre) : paso.a;
  const aciertaObjetivo2 = Array.isArray(objetivo2) ? objetivo2.includes(idClic) : idClic===objetivo2;
  if(aciertaObjetivo2){
    if(paso.tipo==='circulo'){
      const centro = puntos[paso.centro];
      const radio = paso.radioEntre
        ? dist(puntos[paso.radioEntre[0]], puntos[paso.radioEntre[1]])
        : dist(centro, puntos[paso.radioHasta]);
      objetos[paso.id] = { tipo:'circulo', centro, radio };
    } else {
      objetos[paso.id] = { tipo:paso.tipo, p1:puntos[paso.de], p2:puntos[paso.a], extender:!!paso.extender };
    }
    flash(true);
    primerPunto = null;
    avanzarPaso();
  } else {
    flash(false);
  }
  dibujar();
}

let flashEstado = null, flashHasta = 0;
function flash(ok){
  if(ok===null){ dibujar(); return; }
  if(ok) sonidoAcierto(); else sonidoError();
  flashEstado = ok; flashHasta = performance.now()+420;
  requestAnimationFrame(tickFlash);
}
function tickFlash(){
  if(performance.now()<flashHasta){ dibujar(); requestAnimationFrame(tickFlash); }
  else { flashEstado=null; dibujar(); }
}

function avanzarPaso(){
  pasoIdx++;
  pistaActiva = false;
  // los pasos 'puntoEnSegmento' son automaticos (no requieren clic, Euclides dice "tomese al azar")
  // asi que si el paso siguiente es de ese tipo, lo resolvemos enseguida y avanzamos otra vez
  const sig = pasoActual();
  if(sig && sig.tipo==='puntoEnSegmento'){
    resolverPasoEn(sig, puntos, objetos);
    flash(true);
    pasoIdx++;
    pistaActiva = false;
  }
  actualizarBarraHerramientas();
  renderListaPasos();
  actualizarBarraEstado();
  if(!pasoActual()){
    mostrarVerificacion();
    mostrarPanelDemostracion();
  }
}

// ---------- panel de demostracion: fragmentos con resaltado sincronizado ----------
function mostrarPanelDemostracion(){
  const r = RECETAS[propActual];
  const panel = document.getElementById('panel-demostracion');
  if(!r.demostracion || r.demostracion.length===0){ panel.style.display='none'; return; }
  panel.style.display = '';
  demoIdx = 0;
  document.getElementById('demo-fase').textContent = r.tipo==='demostracion' ? 'DEMOSTRACIÓN' : 'APODEIXIS · DEMOSTRACIÓN';
  renderFragmentoDemo();
  // baja la vista suavemente hasta la demostracion recien aparecida, ya que ahora vive mas abajo
  panel.scrollIntoView({ behavior:'smooth', block:'nearest' });
}
const abrirPanelDemostracion = mostrarPanelDemostracion; // alias usado por la automatizacion

function renderGlosarioLateral(frag){
  const cont = document.getElementById('demo-glosario-lateral');
  const codigoPropio = 'I.'+propActual;
  const codigos = [...extraerCitasDeTexto(frag.texto, codigoPropio)];
  const fichas = codigos.map(buscarEnGlosario).filter(Boolean);
  if(fichas.length===0){ cont.innerHTML = ''; return; }
  cont.innerHTML = `<div class="dgl-titulo">Se usa aquí</div>` + fichas.map(f => `
    <div class="ficha-mini">
      <div class="fm-codigo">${f.codigo}</div>
      <div class="fm-titulo">${f.titulo}</div>
      <div class="fm-resumen">${f.resumen}</div>
    </div>
  `).join('');
}

function renderFragmentoDemo(){
  const r = RECETAS[propActual];
  const frag = r.demostracion[demoIdx];
  let html;
  if(frag.resaltaPorClausula){
    let idx = -1;
    html = frag.texto
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="id-punto">$1</span>')
      .replace(/\{\{([^}]+)\}\}/g, (m, contenido) => {
        idx++;
        return `<span class="clausula" data-clausula="${idx}">${contenido}</span>`;
      });
  } else {
    // formato antiguo: todo el fragmento resalta junto (retrocompatibilidad)
    html = frag.texto.replace(/\[\[([^\]]+)\]\]/g, '<span class="resaltado">$1</span>');
  }
  document.getElementById('demo-texto').innerHTML = html;
  document.getElementById('demo-contador').textContent = `${demoIdx+1} / ${r.demostracion.length}`;
  document.getElementById('demo-anterior').disabled = demoIdx===0;
  document.getElementById('demo-siguiente').disabled = demoIdx===r.demostracion.length-1;
  renderGlosarioLateral(frag);

  // clic en una clausula: resalta SOLO lo de esa clausula (no todo el fragmento)
  if(frag.resaltaPorClausula){
    document.querySelectorAll('.clausula').forEach(span=>{
      span.addEventListener('click', ()=>{
        const i = +span.dataset.clausula;
        clausulaActivaResaltado = frag.resaltaPorClausula[i] || null;
        document.querySelectorAll('.clausula').forEach(s=>s.classList.toggle('clausula-activa', s===span));
        dibujar();
      });
    });
    // por defecto, al entrar al fragmento, se resalta TODO lo combinado (todas las clausulas)
    clausulaActivaResaltado = frag.resaltaPorClausula.flat();
  } else {
    clausulaActivaResaltado = frag.resalta || null;
  }

  // disparar acciones especiales de superposicion si el fragmento las define
  if(frag.accion==='superponer_parcial_1') animarSuperposicion(0.55);
  else if(frag.accion==='superponer_parcial_2') animarSuperposicion(0.85);
  else if(frag.accion==='superponer_completo') animarSuperposicion(1);
  else if(frag.accion==='mostrar_hipotetico') mostrarHipotetico(true);
  else if(frag.accion==='ocultar_hipotetico') mostrarHipotetico(false);

  dibujar();
}

function mostrarHipotetico(visible){
  const r = RECETAS[propActual];
  if(!r.hipotetico) return;
  if(visible){
    puntos[r.hipotetico.id] = {...r.hipotetico.posicion};
    (r.hipotetico.segmentos||[]).forEach((s,i)=>{
      objetos['hip'+i] = { tipo:'segmento', p1:puntos[s.de], p2:puntos[s.a] };
    });
  } else {
    delete puntos[r.hipotetico.id];
    (r.hipotetico.segmentos||[]).forEach((s,i)=>{ delete objetos['hip'+i]; });
  }
}

function animarSuperposicion(destino){
  animandoSuperposicion = true;
  const inicio = progresoSuperposicion;
  const t0 = performance.now(); const DUR = 700;
  function tick(){
    const t = Math.min(1,(performance.now()-t0)/DUR);
    progresoSuperposicion = inicio + (destino-inicio)*(1-Math.pow(1-t,3));
    dibujar();
    if(t<1) requestAnimationFrame(tick); else animandoSuperposicion=false;
  }
  requestAnimationFrame(tick);
}

document.getElementById('demo-siguiente').addEventListener('click', ()=>{
  const r = RECETAS[propActual];
  if(demoIdx < r.demostracion.length-1){ demoIdx++; renderFragmentoDemo(); }
});
document.getElementById('demo-anterior').addEventListener('click', ()=>{
  if(demoIdx > 0){ demoIdx--; renderFragmentoDemo(); }
});

// ---------- automatizacion: recorre pasos de construccion + fragmentos de demostracion ----------
function detenerAutomatizacion(){
  automatizando = false;
  if(automatizarTimer){ clearTimeout(automatizarTimer); automatizarTimer = null; }
  document.getElementById('btn-automatizar').textContent = '▶ Automatizar construcción';
  document.getElementById('menu-automatizar').classList.remove('abierto');
}

function iniciarAutomatizacion(){
  if(automatizando) return;
  automatizando = true;
  document.getElementById('btn-automatizar').textContent = '⏸ Detener automatización';
  const r = RECETAS[propActual];
  const delay = VELOCIDADES[velocidadActual];

  function pasoSiguienteAuto(){
    if(!automatizando) return;
    if(faseActual==='construccion' && r.tipo==='construccion'){
      const paso = pasoActual();
      if(paso){
        ejecutarPasoAutomatico(paso);
        automatizarTimer = setTimeout(pasoSiguienteAuto, delay);
        return;
      } else {
        // construccion terminada -> pasar a demostracion
        automatizarTimer = setTimeout(pasoSiguienteAuto, delay);
        return;
      }
    }
    // fase de demostracion (o proposicion puramente teorica)
    const panelDemoVisible = document.getElementById('panel-demostracion').style.display !== 'none';
    if(!panelDemoVisible){ abrirPanelDemostracion(); automatizarTimer = setTimeout(pasoSiguienteAuto, delay); return; }
    const demoLen = (r.demostracion||[]).length;
    if(demoIdx < demoLen-1){
      demoIdx++;
      renderFragmentoDemo();
      automatizarTimer = setTimeout(pasoSiguienteAuto, delay);
    } else {
      detenerAutomatizacion();
    }
  }
  pasoSiguienteAuto();
}

function ejecutarPasoAutomatico(paso){
  if(paso.tipo==='circulo'){
    const centro = puntos[paso.centro];
    const radio = paso.radioEntre
      ? dist(puntos[paso.radioEntre[0]], puntos[paso.radioEntre[1]])
      : dist(centro, puntos[paso.radioHasta]);
    objetos[paso.id] = { tipo:'circulo', centro, radio };
  } else if(paso.tipo==='recta' || paso.tipo==='segmento'){
    objetos[paso.id] = { tipo:paso.tipo, p1:puntos[paso.de], p2:puntos[paso.a], extender:!!paso.extender };
  } else if(paso.tipo==='puntoEnSegmento'){
    resolverPasoEn(paso, puntos, objetos);
  } else if(paso.tipo==='interseccion'){
    const real = resolverInterseccion(paso);
    if(real) puntos[paso.id] = real;
  }
  pasoIdx++;
  pistaActiva = false;
  actualizarBarraHerramientas();
  renderListaPasos();
  actualizarBarraEstado();
  if(!pasoActual()){ mostrarVerificacion(); mostrarPanelDemostracion(); sonidoConstruccionCompleta(); }
  dibujar();
}

document.getElementById('btn-automatizar').addEventListener('click', ()=>{
  if(automatizando){ detenerAutomatizacion(); return; }
  document.getElementById('menu-automatizar').classList.toggle('abierto');
});
document.querySelectorAll('.vel').forEach(b=>{
  b.addEventListener('click', ()=>{
    velocidadActual = b.dataset.vel;
    document.getElementById('menu-automatizar').classList.remove('abierto');
    iniciarAutomatizacion();
  });
});
document.addEventListener('click', e=>{
  const menu = document.getElementById('menu-automatizar');
  if(menu && !menu.contains(e.target)) menu.classList.remove('abierto');
});

// ---------- verificacion final (medir de verdad) ----------
function mostrarVerificacion(){
  const r = RECETAS[propActual];
  if(!r.pasos && !r.esIgualdadDeAreas && !r.esDobleDeArea) return;
  const cont = document.getElementById('verificacion');
  if(r.pasos){
    const paso = r.pasos[r.pasos.length-1];
    if(!paso || !paso.verificar){ cont.innerHTML=''; cont.style.display='none'; return; }
  }
  let html = '';
  if(propActual===1){
    const a=dist(puntos.A,puntos.B), b=dist(puntos.A,puntos.C), c=dist(puntos.B,puntos.C);
    const ok = Math.abs(a-b)<0.5 && Math.abs(b-c)<0.5;
    html = filaVerificacion('AB', 'AC', Math.abs(a-b)<0.5) + filaVerificacion('AC', 'BC', Math.abs(b-c)<0.5) +
      conclusionVerificacion(ok, "Los tres lados son iguales entre sí: el triángulo es equilátero.");
  } else if(propActual===2){
    const al = dist(puntos.A,puntos.L), bc = dist(puntos.B,puntos.C);
    html = filaVerificacion('AL', 'BC', Math.abs(al-bc)<0.5) +
      conclusionVerificacion(Math.abs(al-bc)<0.5, "AL queda igual a BC: la construcción es correcta.");
  } else if(propActual===3){
    const af = dist(puntos.A,puntos.F), cd = dist(puntos.C,puntos.D);
    html = filaVerificacion('AF', 'CD', Math.abs(af-cd)<0.5) +
      conclusionVerificacion(Math.abs(af-cd)<0.5, "AF queda igual a CD: el segmento quedó cortado correctamente.");
  } else if(propActual===5){
    const angB = anguloEntre(puntos.B,puntos.A,puntos.C), angC = anguloEntre(puntos.C,puntos.A,puntos.B);
    html = filaVerificacionAngulo('ángulo ABC', 'ángulo ACB', Math.abs(angB-angC)<0.5) +
      conclusionVerificacion(Math.abs(angB-angC)<0.5, "Los dos ángulos de la base son iguales entre sí.");
  } else if(propActual===9){
    const angDAZ = anguloEntre(puntos.A,puntos.D,puntos.Z), angEAZ = anguloEntre(puntos.A,puntos.E,puntos.Z);
    html = filaVerificacionAngulo('ángulo DAZ', 'ángulo EAZ', Math.abs(angDAZ-angEAZ)<0.5) +
      conclusionVerificacion(Math.abs(angDAZ-angEAZ)<0.5, "El ángulo quedó dividido en dos partes iguales.");
  } else if(propActual===10){
    const ad = dist(puntos.A,puntos.M), bd = dist(puntos.B,puntos.M);
    html = filaVerificacion('AM', 'MB', Math.abs(ad-bd)<0.5) +
      conclusionVerificacion(Math.abs(ad-bd)<0.5, "El segmento quedó dividido en dos partes iguales.");
  } else if(propActual===11){
    const angDCZ = anguloEntre(puntos.C,puntos.D,puntos.Z), angECZ = anguloEntre(puntos.C,puntos.E,puntos.Z);
    html = filaVerificacionAngulo('ángulo DCZ', 'ángulo ECZ', Math.abs(angDCZ-angECZ)<0.5) +
      conclusionVerificacion(Math.abs(angDCZ-angECZ)<0.5, "Ambos ángulos son rectos: ZC es perpendicular a AB.");
  } else if(propActual===12){
    const angCGH = anguloEntre(puntos.G,puntos.C,puntos.H), angCGE = anguloEntre(puntos.G,puntos.C,puntos.E);
    html = filaVerificacionAngulo('ángulo CGH', 'ángulo CGE', Math.abs(angCGH-angCGE)<0.5) +
      conclusionVerificacion(Math.abs(angCGH-angCGE)<0.5, "Ambos ángulos son rectos: CG es perpendicular a AB.");
  } else if(propActual===22){
    const fk = dist(puntos.F,puntos.K), p = dist(puntos.P1,puntos.P2);
    const gk = dist(puntos.G,puntos.K), r = dist(puntos.R1,puntos.R2);
    html = filaVerificacion('FK', 'P', Math.abs(fk-p)<0.5) + filaVerificacion('GK', 'R', Math.abs(gk-r)<0.5) +
      conclusionVerificacion(Math.abs(fk-p)<0.5 && Math.abs(gk-r)<0.5, "El triángulo FGK tiene los tres lados pedidos.");
  } else if(propActual===23){
    const angFAG = anguloEntre(puntos.A,puntos.F,puntos.G), angDCE = anguloEntre(puntos.C,puntos.D,puntos.E);
    html = filaVerificacionAngulo('ángulo FAG', 'ángulo DCE', Math.abs(angFAG-angDCE)<0.5) +
      conclusionVerificacion(Math.abs(angFAG-angDCE)<0.5, "El ángulo quedó copiado correctamente.");
  } else if(propActual===31){
    const pendienteBC = (puntos.C.y-puntos.B.y)/(puntos.C.x-puntos.B.x);
    const pendienteAG = (puntos.G.y-puntos.A.y)/(puntos.G.x-puntos.A.x);
    const sonParalelas = Math.abs(pendienteBC-pendienteAG)<0.01;
    html = `<div class="fila-verif"><span class="fv-nombre">AG</span><span class="fv-comparador">∥</span><span class="fv-nombre">BC</span></div>` +
      conclusionVerificacion(sonParalelas, "La recta AG resultó paralela a BC.");
  } else if(propActual===35){
    const areaABCD = areaPoligono([puntos.A,puntos.B,puntos.C,puntos.D]);
    const areaEBCF = areaPoligono([puntos.E,puntos.B,puntos.C,puntos.F]);
    const sonIguales = Math.abs(areaABCD-areaEBCF) < 1;
    html = `<div class="fila-verif"><span class="fv-nombre">área de ABCD</span><span class="fv-comparador">${sonIguales?'≡':'≠'}</span><span class="fv-nombre">área de EBCF</span></div>` +
      conclusionVerificacion(sonIguales, "Las dos áreas son iguales, aunque los paralelogramos no son congruentes.");
  } else if(propActual===36){
    const areaABCD = areaPoligono([puntos.A,puntos.B,puntos.C,puntos.D]);
    const areaEFGH = areaPoligono([puntos.E,puntos.F,puntos.G,puntos.H]);
    const sonIguales = Math.abs(areaABCD-areaEFGH) < 1;
    html = `<div class="fila-verif"><span class="fv-nombre">área de ABCD</span><span class="fv-comparador">${sonIguales?'≡':'≠'}</span><span class="fv-nombre">área de EFGH</span></div>` +
      conclusionVerificacion(sonIguales, "Las dos áreas son iguales: bases iguales, mismas paralelas.");
  } else if(propActual===37){
    const areaABC = areaPoligono([puntos.A,puntos.B,puntos.C]);
    const areaDBC = areaPoligono([puntos.D,puntos.B,puntos.C]);
    const sonIguales = Math.abs(areaABC-areaDBC) < 1;
    html = `<div class="fila-verif"><span class="fv-nombre">área de ABC</span><span class="fv-comparador">${sonIguales?'≡':'≠'}</span><span class="fv-nombre">área de DBC</span></div>` +
      conclusionVerificacion(sonIguales, "Las dos áreas son iguales: misma base, mismas paralelas.");
  } else if(propActual===38){
    const areaABC = areaPoligono([puntos.A,puntos.B,puntos.C]);
    const areaDGH = areaPoligono([puntos.D,puntos.G,puntos.H]);
    const sonIguales = Math.abs(areaABC-areaDGH) < 1;
    html = `<div class="fila-verif"><span class="fv-nombre">área de ABC</span><span class="fv-comparador">${sonIguales?'≡':'≠'}</span><span class="fv-nombre">área de DGH</span></div>` +
      conclusionVerificacion(sonIguales, "Las dos áreas son iguales: bases iguales, mismas paralelas.");
  } else if(propActual===39 || propActual===40){
    html = conclusionVerificacion(true, "La figura ya muestra los dos vértices sobre la misma paralela a la base.");
  } else if(propActual===41){
    const areaParalelogramo = areaPoligono([puntos.A,puntos.B,puntos.C,puntos.D]);
    const areaTriangulo = areaPoligono([puntos.D,puntos.B,puntos.C]);
    const esDoble = Math.abs(areaParalelogramo - 2*areaTriangulo) < 1;
    html = `<div class="fila-verif"><span class="fv-nombre">área de ABCD</span><span class="fv-comparador">${esDoble?'= 2 ×':'≠ 2 ×'}</span><span class="fv-nombre">área de DBC</span></div>` +
      conclusionVerificacion(esDoble, "El paralelogramo es exactamente el doble del triángulo.");
  } else if(propActual===42){
    const areaABC = areaPoligono([puntos.A,puntos.B,puntos.C]);
    const areaFECG = areaPoligono([puntos.F,puntos.E,puntos.C,puntos.G]);
    const sonIguales = Math.abs(areaABC-areaFECG) < 1;
    html = `<div class="fila-verif"><span class="fv-nombre">área de ABC</span><span class="fv-comparador">${sonIguales?'≡':'≠'}</span><span class="fv-nombre">área de FECG</span></div>` +
      conclusionVerificacion(sonIguales, "El paralelogramo construido es igual al triángulo dado.");
  } else if(propActual===43){
    html = conclusionVerificacion(true, "Los dos complementos respecto a la diagonal son iguales en área.");
  } else if(propActual===44){
    const areaABMLp = areaPoligono([puntos.A,puntos.B,puntos.M,puntos.Lp]);
    const areaTri = areaPoligono([puntos.C1,puntos.C2,puntos.C3]);
    const sonIguales = Math.abs(areaABMLp-areaTri) < 1;
    html = `<div class="fila-verif"><span class="fv-nombre">área de ABMLp</span><span class="fv-comparador">${sonIguales?'≡':'≠'}</span><span class="fv-nombre">área del triángulo</span></div>` +
      conclusionVerificacion(sonIguales, "El paralelogramo aplicado sobre AB es igual al triángulo dado.");
  } else if(propActual===45){
    const areaABMLp = areaPoligono([puntos.A,puntos.B,puntos.M,puntos.Lp]);
    const areaPQRS = areaPoligono([puntos.P,puntos.Q,puntos.R,puntos.S]);
    const sonIguales = Math.abs(areaABMLp-areaPQRS) < 1;
    html = `<div class="fila-verif"><span class="fv-nombre">área de ABMLp</span><span class="fv-comparador">${sonIguales?'≡':'≠'}</span><span class="fv-nombre">área de PQRS</span></div>` +
      conclusionVerificacion(sonIguales, "El paralelogramo es igual a la figura rectilínea dada.");
  } else if(propActual===46){
    const ab=dist(puntos.A,puntos.B), bd=dist(puntos.B,puntos.D), dc=dist(puntos.D,puntos.C), ca=dist(puntos.C,puntos.A);
    const angA = anguloEntre(puntos.A,puntos.B,puntos.C);
    const ok = Math.abs(ab-bd)<0.5 && Math.abs(bd-dc)<0.5 && Math.abs(dc-ca)<0.5 && Math.abs(angA-90)<0.5;
    html = filaVerificacion('AB', 'BD', Math.abs(ab-bd)<0.5) + filaVerificacion('DC', 'CA', Math.abs(dc-ca)<0.5) +
      conclusionVerificacion(ok, "Los cuatro lados son iguales y los ángulos son rectos: es un cuadrado.");
  } else if(propActual===47){
    const areaHipotenusa = areaPoligono([puntos.B,puntos.C,puntos.E,puntos.D]);
    const areaCateto1 = areaPoligono([puntos.A,puntos.B,puntos.F,puntos.G]);
    const areaCateto2 = areaPoligono([puntos.A,puntos.C,puntos.H,puntos.K]);
    const sumaCatetos = areaCateto1 + areaCateto2;
    const sonIguales = Math.abs(areaHipotenusa-sumaCatetos) < 1;
    html = `<div class="fila-verif"><span class="fv-nombre">cuadrado de BC</span><span class="fv-comparador">${sonIguales?'≡':'≠'}</span><span class="fv-nombre">cuadrado de AB + cuadrado de AC</span></div>` +
      conclusionVerificacion(sonIguales, "El cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos.");
  }
  cont.innerHTML = html;
  cont.style.display = '';
}
function anguloEntre(verticeP, p1, p2){
  const v1={x:p1.x-verticeP.x,y:p1.y-verticeP.y}, v2={x:p2.x-verticeP.x,y:p2.y-verticeP.y};
  const dot=v1.x*v2.x+v1.y*v2.y, m1=Math.hypot(v1.x,v1.y), m2=Math.hypot(v2.x,v2.y);
  return Math.acos(Math.max(-1,Math.min(1,dot/(m1*m2))))*180/Math.PI;
}
// area de un poligono (shoelace) -- SOLO uso interno para comparar igualdad de areas;
// el numero resultante nunca se muestra al usuario (Euclides no asigna numeros a las areas).
function areaPoligono(puntosPoligono){
  let suma=0;
  for(let i=0;i<puntosPoligono.length;i++){
    const p1=puntosPoligono[i], p2=puntosPoligono[(i+1)%puntosPoligono.length];
    suma += p1.x*p2.y - p2.x*p1.y;
  }
  return Math.abs(suma)/2;
}
function filaVerificacion(nombreA, nombreB, sonIguales){
  const marca = sonIguales ? '≡' : '≠';
  return `<div class="fila-verif"><span class="fv-nombre">${nombreA}</span><span class="fv-comparador">${marca}</span><span class="fv-nombre">${nombreB}</span></div>`;
}
function filaVerificacionAngulo(nombreA, nombreB, sonIguales){
  return filaVerificacion(nombreA, nombreB, sonIguales);
}
function conclusionVerificacion(ok, texto){
  return `<div class="fv-conclusion ${ok?'fv-ok':'fv-mal'}">${ok?'✓':'✕'} ${texto}</div>`;
}

// ---------- controles generales ----------
document.getElementById('btn-reiniciar').addEventListener('click', ()=>cargarProposicion(propActual));
document.getElementById('btn-pista').addEventListener('click', ()=>{ pistaActiva = true; dibujar(); });
document.getElementById('btn-paso-anterior').addEventListener('click', ()=>{
  if(faseActual!=='construccion') return;
  if(pasoIdx>0) irAPaso(pasoIdx-1);
});
document.getElementById('btn-paso-siguiente').addEventListener('click', ()=>{
  if(faseActual!=='construccion') return;
  const paso = pasoActual();
  if(paso) ejecutarPasoAutomatico(paso);
});
document.getElementById('btn-encuadrar').addEventListener('click', ()=>{
  const r = RECETAS[propActual];
  encuadrar(r.tipo==='demostracion' ? Object.values(puntos) : estimarRangoFinal(r));
  dibujar();
});

// ---------- generar el selector de proposiciones dinamicamente, marcando construccion vs teorema ----------
function renderSelectorProposiciones(){
  const cont = document.getElementById('selector-prop');
  const maxProp = Math.max(...Object.keys(RECETAS).map(Number));
  let html = '';
  for(let n=1; n<=maxProp; n++){
    const esConstruccion = RECETAS[n].tipo === 'construccion';
    const marca = esConstruccion ? '⚒' : '∴';
    const claseTipo = esConstruccion ? 'tipo-construccion' : 'tipo-demostracion';
    const tituloHover = esConstruccion ? 'Construcción' : 'Teorema (demostración)';
    html += `<button class="btn-prop ${claseTipo}${n===1?' activo':''}" data-prop="${n}" title="${tituloHover}"><span class="marca-tipo">${marca}</span>I.${n}</button>`;
  }
  cont.innerHTML = html;
  cont.querySelectorAll('.btn-prop').forEach(b=>{
    b.addEventListener('click', ()=>cargarProposicion(+b.dataset.prop));
  });
}
renderSelectorProposiciones();

// ---------- render ----------
function trazoIrregular(ctx, x1,y1,x2,y2, semilla, amplitud){
  const segmentos = 16;
  const dx0=x2-x1, dy0=y2-y1, len=Math.hypot(dx0,dy0)||1;
  const px=-dy0/len, py=dx0/len;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  for(let i=1;i<=segmentos;i++){
    const t=i/segmentos;
    const x=x1+dx0*t, y=y1+dy0*t;
    const v = Math.sin((semilla+i)*12.9898)*43758.5453;
    const n = v - Math.floor(v);
    const jitter = (n-0.5)*amplitud;
    ctx.lineTo(x+px*jitter, y+py*jitter);
  }
  ctx.stroke();
}

function fragmentoActivoResaltado(){
  if(faseActual!=='demostracion' && pasoActual()) return null; // construccion en curso: sin resaltado de prosa
  const r = RECETAS[propActual];
  if(!r.demostracion) return null;
  return r.demostracion[demoIdx] || null;
}

function normalizarAngulo(a){
  while(a<0) a+=2*Math.PI;
  while(a>=2*Math.PI) a-=2*Math.PI;
  return a;
}
function arcoMenor(a1, a2){
  a1 = normalizarAngulo(a1); a2 = normalizarAngulo(a2);
  const diff = normalizarAngulo(a2-a1); // recorrido horario de a1 a a2
  if(diff <= Math.PI) return { inicio:a1, fin:a2 };
  return { inicio:a2, fin:a1 }; // el horario de a1->a2 era el reflejo; a2->a1 es el arco menor
}

function dibujarResaltadoGeometrico(lista){
  for(const item of lista){
    if(item.tipo==='segmento'){
      const p1 = puntos[item.de], p2 = puntos[item.a];
      if(!p1||!p2) continue;
      const pp1 = mundoAPantalla(p1), pp2 = mundoAPantalla(p2);
      ctx.save();
      ctx.strokeStyle = COLOR.segmento; ctx.lineWidth = 3; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(pp1.x,pp1.y); ctx.lineTo(pp2.x,pp2.y); ctx.stroke();
      ctx.restore();
    } else if(item.tipo==='triangulo' || item.tipo==='poligono'){
      const pts = item.puntos.map(id=>puntos[id]);
      if(pts.some(p=>!p) || pts.length<3) continue;
      const ppts = pts.map(mundoAPantalla);
      ctx.save();
      ctx.strokeStyle = COLOR.triangulo; ctx.lineWidth = 2.6; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(ppts[0].x,ppts[0].y);
      for(let i=1;i<ppts.length;i++) ctx.lineTo(ppts[i].x,ppts[i].y);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = COLOR.trianguloRelleno;
      ctx.fill();
      ctx.restore();
    } else if(item.tipo==='angulo'){
      const v = puntos[item.vertice], p1 = puntos[item.r1], p2 = puntos[item.r2];
      if(!v||!p1||!p2) continue;
      const vp = mundoAPantalla(v);
      const a1 = Math.atan2(p1.y-v.y, p1.x-v.x);
      const a2 = Math.atan2(p2.y-v.y, p2.x-v.x);
      const {inicio, fin} = arcoMenor(a1, a2);
      ctx.save();
      ctx.strokeStyle = COLOR.angulo; ctx.lineWidth = 2.4; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(vp.x, vp.y, 26, inicio, fin);
      ctx.stroke();
      ctx.restore();
    } else if(item.tipo==='circulo'){
      const o = objetos[item.id];
      if(!o) continue;
      const cp = mundoAPantalla(o.centro);
      ctx.save();
      ctx.strokeStyle = COLOR.circuloResaltado; ctx.lineWidth = 2.4; ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.arc(cp.x, cp.y, o.radio*camara.escala, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }
  }
}

function dibujar(){
  ctx.clearRect(0,0,W,H);
  const paso = pasoActual();
  const r = RECETAS[propActual];
  const fragActivo = fragmentoActivoResaltado();
  const atenuar = !!fragActivo; // si hay un fragmento de demostracion activo, el resto se atenua

  const idUltimo = (r.tipo==='construccion' && pasoIdx>0 && faseActual==='construccion') ? r.pasos[pasoIdx-1].id : null;

  for(const id in objetos){
    const o = objetos[id];
    const esReciente = id===idUltimo;
    ctx.lineWidth = esReciente ? 2.1 : 1.6;
    ctx.strokeStyle = atenuar ? COLOR.trazoTenue : (esReciente ? COLOR.exito : COLOR.trazo);
    ctx.globalAlpha = atenuar ? 1 : (esReciente ? 0.95 : 0.85);
    if(o.tipo==='circulo'){
      const cp = mundoAPantalla(o.centro);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, o.radio*camara.escala, 0, Math.PI*2);
      ctx.stroke();
    } else if(o.tipo==='recta' || o.tipo==='segmento'){
      let p1=o.p1, p2=o.p2;
      if(o.extender){
        const dx=p2.x-p1.x, dy=p2.y-p1.y, len=Math.hypot(dx,dy);
        const ext = 2000;
        p2 = { x:p1.x+dx/len*(len+ext), y:p1.y+dy/len*(len+ext) };
      }
      const p1p = mundoAPantalla(p1), p2p = mundoAPantalla(p2);
      trazoIrregular(ctx, p1p.x,p1p.y, p2p.x,p2p.y, id.length*7+1, 0.5);
    }
    ctx.globalAlpha = 1;
  }

  // resaltado sincronizado con la clausula activa (o todo el fragmento, si no hay clausulas)
  if(fragActivo && clausulaActivaResaltado){
    dibujarResaltadoGeometrico(clausulaActivaResaltado);
  }

  // superposicion animada (I.4, I.8)
  if(r.superposicion){
    const sup = r.superposicion;
    const [a0,b0,c0] = sup.origen.map(id=>puntos[id]);
    const [a1,b1,c1] = sup.destino.map(id=>puntos[id]);
    const t = progresoSuperposicion;
    if(t>0){
      const lerp=(p,q,t)=>({x:p.x+(q.x-p.x)*t, y:p.y+(q.y-p.y)*t});
      const A2=lerp(a0,a1,t), B2=lerp(b0,b1,t), C2=lerp(c0,c1,t);
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = COLOR.activo; ctx.lineWidth=2.4;
      [[A2,B2],[A2,C2]].forEach(([p,q])=>{
        const pp=mundoAPantalla(p), qp=mundoAPantalla(q);
        ctx.beginPath(); ctx.moveTo(pp.x,pp.y); ctx.lineTo(qp.x,qp.y); ctx.stroke();
      });
      if(t>0.92){
        ctx.strokeStyle = COLOR.exito; ctx.lineWidth=3;
        const bp=mundoAPantalla(B2), cp=mundoAPantalla(C2);
        ctx.beginPath(); ctx.moveTo(bp.x,bp.y); ctx.lineTo(cp.x,cp.y); ctx.stroke();
      }
      [A2,B2,C2].forEach((p)=>{
        const pp=mundoAPantalla(p);
        ctx.fillStyle=COLOR.activo;
        ctx.beginPath(); ctx.arc(pp.x,pp.y,4.5,0,Math.PI*2); ctx.fill();
      });
      ctx.restore();
    }
  }

  // preview en vivo del trazo en curso (dos clics): desde primerPunto hasta el mouse
  if(primerPunto && herramientaActiva){
    const p1 = mundoAPantalla(puntos[primerPunto]);
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = COLOR.preview;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6,5]);
    if(herramientaActiva==='circulo'){
      const radioPrevM = dist(puntos[primerPunto], mouseM);
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, radioPrevM*camara.escala, 0, Math.PI*2);
      ctx.stroke();
    } else if(herramientaActiva==='recta' || herramientaActiva==='segmento'){
      let p2prev = mouseP;
      if(herramientaActiva==='recta'){
        const dx=mouseP.x-p1.x, dy=mouseP.y-p1.y, len=Math.hypot(dx,dy)||1;
        p2prev = { x:p1.x+dx/len*2600, y:p1.y+dy/len*2600 };
      }
      ctx.beginPath();
      ctx.moveTo(p1.x,p1.y);
      ctx.lineTo(p2prev.x,p2prev.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // puntos (encima de todo)
  for(const id in puntos){
    const pp = mundoAPantalla(puntos[id]);
    if(pp.x<-30||pp.x>W+30||pp.y<-30||pp.y>H+30) continue;
    let esObjetivo = false;
    if(paso && herramientaActiva){
      if(!primerPunto){
        esObjetivo = id===(paso.tipo==='circulo'?paso.centro:paso.de);
      } else if(paso.tipo==='circulo' && paso.radioEntre){
        esObjetivo = paso.radioEntre.includes(id);
      } else {
        esObjetivo = id===(paso.tipo==='circulo'?paso.radioHasta:paso.a);
      }
    }
    ctx.beginPath();
    ctx.arc(pp.x,pp.y,RADIO_PUNTO_PANT,0,Math.PI*2);
    ctx.fillStyle = atenuar ? 'rgba(42,33,23,.45)' : (id===primerPunto ? COLOR.activo : COLOR.trazoFuerte);
    ctx.fill();
    if(esObjetivo){
      const cerca = dist(mouseP, pp) < TOLERANCIA_CLIC_PANT+8;
      ctx.beginPath();
      ctx.arc(pp.x,pp.y, cerca?12:9, 0,Math.PI*2);
      ctx.strokeStyle = cerca ? COLOR.exito : COLOR.activoSuave;
      ctx.lineWidth = cerca?2.4:1.6;
      ctx.stroke();
    }
    ctx.font = "italic 600 16px 'Spectral', serif";
    ctx.fillStyle = atenuar ? 'rgba(42,33,23,.55)' : COLOR.trazoFuerte;
    ctx.fillText(id, pp.x+9, pp.y-8);
  }

  // pista: resaltar tenue donde esta la interseccion que se busca en el paso actual
  if(paso && paso.tipo==='interseccion' && pistaActiva){
    const real = resolverInterseccion(paso);
    if(real){
      const pp = mundoAPantalla(real);
      ctx.beginPath();
      ctx.arc(pp.x,pp.y,15,0,Math.PI*2);
      ctx.strokeStyle = COLOR.exitoSuave; ctx.lineWidth=2; ctx.setLineDash([3,4]);
      ctx.stroke(); ctx.setLineDash([]);
    }
  }

  // flash de acierto/error sobre el mouse
  if(flashEstado!==null){
    ctx.beginPath();
    ctx.arc(mouseP.x,mouseP.y,18,0,Math.PI*2);
    ctx.strokeStyle = flashEstado ? COLOR.exitoSuave : 'rgba(163,50,46,.7)';
    ctx.lineWidth=3; ctx.stroke();
  }
}

// ---------- panel de glosario ----------
let grupoGlosarioActivo = 'proposiciones';

function renderGlosario(){
  const cont = document.getElementById('glosario-fichas');
  const entradas = GLOSARIO[grupoGlosarioActivo] || [];
  cont.innerHTML = entradas.map(e => `
    <div class="ficha-glosario">
      <span class="fg-codigo">${e.codigo}</span>${e.tipo?`<span class="fg-tipo">${e.tipo}</span>`:''}
      <div class="fg-titulo">${e.titulo}</div>
      <div class="fg-resumen">${e.resumen}</div>
    </div>
  `).join('');
}

document.getElementById('btn-sonido').addEventListener('click', ()=>{
  sonidoActivado = !sonidoActivado;
  const btn = document.getElementById('btn-sonido');
  btn.textContent = sonidoActivado ? '🔊 Sonido' : '🔇 Sonido';
  if(sonidoActivado) obtenerContextoAudio(); // activa el contexto en el primer gesto del usuario
});

document.getElementById('btn-glosario').addEventListener('click', ()=>{
  document.getElementById('overlay-glosario').style.display = 'flex';
  renderGlosario();
});
document.getElementById('btn-cerrar-glosario').addEventListener('click', ()=>{
  document.getElementById('overlay-glosario').style.display = 'none';
});
document.getElementById('overlay-glosario').addEventListener('click', (e)=>{
  if(e.target.id === 'overlay-glosario') document.getElementById('overlay-glosario').style.display = 'none';
});
document.querySelectorAll('.glos-tab').forEach(b=>{
  b.addEventListener('click', ()=>{
    grupoGlosarioActivo = b.dataset.grupo;
    document.querySelectorAll('.glos-tab').forEach(x=>x.classList.toggle('activo', x===b));
    renderGlosario();
  });
});

// ---------- macroestructura lógica: dependencias de la proposición actual ----------
function normalizarCita(cita){
  return cita.replace(/[\[\]]/g,'').replace(/\s+/g,'').replace('I,','I.');
}
// Extrae todas las citas a otras proposiciones/postulados/nociones/definiciones presentes en un
// texto, aceptando tanto el formato formal "[I,4]" "[N.C. 1]" "[Post. 3]" "[Def. 15]" como las
// menciones libres en prosa "I.4" sin corchetes. Funcion UNICA y centralizada -- usada tanto por
// el glosario lateral de la demostracion como por la macroestructura, para que nunca queden
// desincronizadas entre si.
function extraerCitasDeTexto(texto, codigoPropioExcluir){
  const citas = new Set();
  const matchesFormales = texto.match(/\[(I,\d+|N\.C\.\s*\d+|Post\.\s*\d+|Def\.\s*\d+)\]/g) || [];
  matchesFormales.forEach(m=>citas.add(normalizarCita(m)));
  const matchesInline = texto.match(/I\.\d+/g) || [];
  matchesInline.forEach(m=>{ if(m !== codigoPropioExcluir) citas.add(m); });
  return citas;
}

function extraerDependencias(receta, numeroPropio){
  const citas = new Set();
  const codigoPropio = 'I.'+numeroPropio;
  (receta.demostracion||[]).forEach(frag=>{
    extraerCitasDeTexto(frag.texto, codigoPropio).forEach(c=>citas.add(c));
  });
  (receta.pasos||[]).forEach(p=>{
    extraerCitasDeTexto(p.instruccion, codigoPropio).forEach(c=>citas.add(c));
  });
  return [...citas];
}
function buscarEnGlosario(codigo){
  for(const grupo of Object.values(GLOSARIO)){
    const hallado = grupo.find(e=>e.codigo.replace(/\s+/g,'')===codigo.replace(/\s+/g,''));
    if(hallado) return hallado;
  }
  return null;
}

function dependenciasDeCodigo(codigo){
  const m = codigo.match(/^I\.(\d+)$/);
  if(!m) return [];
  const n = +m[1];
  if(!RECETAS[n]) return [];
  return extraerDependencias(RECETAS[n], n);
}

// Construye niveles por profundidad MAXIMA real de cada nodo (la cadena transitiva mas larga
// desde la raiz hasta ese nodo) -- asi una proposicion citada directamente pero que TAMBIEN
// se alcanza por un camino mas largo aparece en su nivel mas profundo, no en el superficial.
// SOLO incluye proposiciones (I.N): los postulados, nociones comunes y definiciones quedan
// fuera del diagrama (son axiomas, no parte de la cadena deductiva entre teoremas).
function construirNivelesDependencia(codigoRaiz){
  const profundidad = {};
  function visitar(codigo, profActual, pila){
    if(!/^I\.\d+$/.test(codigo)) return; // solo proposiciones, no postulados/nociones/definiciones
    if(pila.includes(codigo)) return; // evita ciclos (no deberia haberlos, pero por seguridad)
    if(profundidad[codigo]!==undefined && profundidad[codigo]>=profActual) return;
    profundidad[codigo] = profActual;
    for(const dep of dependenciasDeCodigo(codigo)){
      visitar(dep, profActual+1, [...pila, codigo]);
    }
  }
  visitar(codigoRaiz, 0, []);
  const maxProf = Math.max(...Object.values(profundidad));
  const niveles = [];
  for(let p=0;p<=maxProf;p++){
    niveles.push(Object.keys(profundidad).filter(c=>profundidad[c]===p));
  }
  return niveles;
}

function renderMacroestructura(){
  const codigoActual = 'I.' + propActual;
  const niveles = construirNivelesDependencia(codigoActual); // nivel 0 = raiz, nivel maximo = mas profundo
  const cont = document.getElementById('macroestructura-cont');

  if(niveles.length<=1){
    cont.innerHTML = `<p class="macro-vacio">Esta proposición no depende de ninguna proposición anterior — es uno de los puntos de partida del Libro I.</p>`;
    return;
  }

  const anchoNodo = 160, altoNodo = 60, espacioH = 26, espacioV = 88;
  const numNiveles = niveles.length;
  // nivel 0 (raiz) arriba del todo; nivel maximo (mas fundacional) abajo del todo
  const filaY = (nivel) => nivel*(altoNodo+espacioV) + altoNodo/2 + 10;
  const maxColumnas = Math.max(...niveles.map(n=>n.length));
  const svgAncho = maxColumnas*(anchoNodo+espacioH) + 20;
  const svgAlto = numNiveles*(altoNodo+espacioV) + 20;

  const posiciones = {}; // codigo -> {x,y}
  niveles.forEach((lista, nivel)=>{
    const anchoFila = lista.length*(anchoNodo+espacioH)-espacioH;
    const xInicio = (svgAncho-anchoFila)/2;
    lista.forEach((codigo,i)=>{
      posiciones[codigo] = { x: xInicio + i*(anchoNodo+espacioH) + anchoNodo/2, y: filaY(nivel) };
    });
  });

  let flechas = '';
  Object.keys(posiciones).forEach(codigo=>{
    const p1 = posiciones[codigo]; // el nodo que cita (mas arriba, Y menor)
    dependenciasDeCodigo(codigo).forEach(dep=>{
      const p2 = posiciones[dep]; // lo citado (mas abajo, Y mayor)
      if(!p2) return;
      // la flecha sale del borde superior de p2 (lo citado, abajo) y llega al borde inferior de p1 (arriba)
      const yInicio = p2.y - altoNodo/2, yFin = p1.y + altoNodo/2;
      const offsetControl = Math.min(Math.abs(yInicio-yFin)*0.5, 50);
      flechas += `<path d="M ${p2.x} ${yInicio} C ${p2.x} ${yInicio-offsetControl}, ${p1.x} ${yFin+offsetControl}, ${p1.x} ${yFin}"
        class="macro-flecha" marker-end="url(#flechaPunta)"/>`;
    });
  });

  let nodos = '';
  Object.keys(posiciones).forEach(codigo=>{
    const ficha = buscarEnGlosario(codigo);
    if(!ficha) return;
    const p = posiciones[codigo];
    const esRaiz = codigo===codigoActual;
    const esConstruccion = ficha.tipo && ficha.tipo.includes('construcción');
    nodos += `
      <g class="macro-nodo ${esRaiz?'macro-nodo-raiz':''} ${esConstruccion?'macro-nodo-construccion':'macro-nodo-demostracion'}" data-codigo="${codigo}">
        <foreignObject x="${p.x-anchoNodo/2}" y="${p.y-altoNodo/2}" width="${anchoNodo}" height="${altoNodo}">
          <div xmlns="http://www.w3.org/1999/xhtml" class="macro-nodo-html">
            <div class="macro-codigo">${ficha.codigo}</div>
            <div class="macro-titulo">${ficha.titulo}</div>
          </div>
        </foreignObject>
      </g>`;
  });

  cont.innerHTML = `
    <svg viewBox="0 0 ${svgAncho} ${svgAlto}" class="macro-svg" style="min-width:${Math.min(svgAncho,1040)}px">
      <defs>
        <marker id="flechaPunta" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 Z" fill="var(--cuero)"/>
        </marker>
      </defs>
      ${flechas}
      ${nodos}
    </svg>`;

  cont.querySelectorAll('.macro-nodo').forEach(nodo=>{
    nodo.style.cursor = 'pointer';
    nodo.addEventListener('click', ()=>{
      const codigo = nodo.dataset.codigo;
      const m = codigo.match(/^I\.(\d+)$/);
      if(m){
        document.getElementById('overlay-macro').style.display = 'none';
        cargarProposicion(+m[1]);
      } else {
        grupoGlosarioActivo = codigo.startsWith('N.C')?'nocionesComunes':codigo.startsWith('Post')?'postulados':'definiciones';
        document.getElementById('overlay-macro').style.display = 'none';
        document.getElementById('overlay-glosario').style.display = 'flex';
        document.querySelectorAll('.glos-tab').forEach(x=>x.classList.toggle('activo', x.dataset.grupo===grupoGlosarioActivo));
        renderGlosario();
      }
    });
  });
}
function envolverTexto(texto, maxCaracteres){
  const palabras = texto.split(' ');
  const lineas = []; let actual = '';
  palabras.forEach(p=>{
    if((actual+' '+p).trim().length > maxCaracteres){ lineas.push(actual.trim()); actual = p; }
    else actual += ' '+p;
  });
  if(actual.trim()) lineas.push(actual.trim());
  return lineas.slice(0,2).map((l,i)=>`<tspan x="0" dy="${i===0?0:14}">${l}</tspan>`).join('');
}

document.getElementById('btn-macroestructura').addEventListener('click', ()=>{
  document.getElementById('overlay-macro').style.display = 'flex';
  renderMacroestructura();
});
document.getElementById('btn-cerrar-macro').addEventListener('click', ()=>{
  document.getElementById('overlay-macro').style.display = 'none';
});
document.getElementById('overlay-macro').addEventListener('click', (e)=>{
  if(e.target.id === 'overlay-macro') document.getElementById('overlay-macro').style.display = 'none';
});

cargarProposicion(1);

// ============================================================
// © 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.
// Colección: Otros Simuladores (Historia de las Matemáticas)
// https://dmbourbaki.github.io/
// Queda prohibida la reproducción, distribución o modificación total
// o parcial de este código sin autorización previa y por escrito del
// autor. Contacto: dmbourbaki@gmail.com
// ============================================================

// ============================================================
// RECETAS — Elementos de Euclides, Libro I, Proposiciones 1-10
// Prosa basada en la edición Gredos (trad. Vara Donado, 1991).
// Cada proposición es "construccion" (con pasos de herramienta + demostración
// final fragmentada) o "demostracion" (puramente teórica: superposición o
// reducción al absurdo, sin construcción nueva con regla y compás).
//
// Fragmentos de demostración: cada uno tiene `texto` (con [[ID]] marcando
// los puntos a resaltar inline) y `resalta`: lista de instrucciones de
// resaltado geométrico, ej. {tipo:'segmento',de:'A',a:'Z'} o
// {tipo:'triangulo',puntos:['A','Z','G']} o {tipo:'angulo',vertice:'A',r1:'Z',r2:'H'}.
// ============================================================

const RECETAS = {

1: {
  tipo: "construccion",
  numeroRomano: "I",
  titulo: "Construir un triángulo equilátero sobre una recta finita dada.",
  enunciado: "Sea [[A]][[B]] la recta finita dada. Así pues, hay que construir sobre la recta AB un triángulo equilátero.",
  puntosDados: { A:{x:-140,y:60}, B:{x:140,y:60} },
  segmentosDados: [ {id:"AB", de:"A", a:"B"} ],
  pasos: [
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"A", radioHasta:"B",
      instruccion:"Traza una circunferencia con centro en A que pase por B." },
    { tipo:"circulo", herramienta:"circulo", id:"c2", centro:"B", radioHasta:"A",
      instruccion:"Traza una circunferencia con centro en B que pase por A." },
    { tipo:"interseccion", herramienta:"punto", id:"C", obj1:"c1", obj2:"c2", cual:"arriba",
      instruccion:"Marca el punto C donde se cortan las dos circunferencias, por encima de AB." },
    { tipo:"segmento", herramienta:"segmento", id:"AC", de:"A", a:"C",
      instruccion:"Traza el segmento AC." },
    { tipo:"segmento", herramienta:"segmento", id:"BC", de:"B", a:"C",
      instruccion:"Traza el segmento BC." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["AB","AC","BC"] }
  ],
  demostracion: [
    { texto:"{{El punto [[A]] es el centro de la circunferencia que pasa por [[B]] y [[C]]}}, así que {{el segmento [[A]][[C]] es igual al segmento [[A]][[B]]}} [Def. 15];",
      resaltaPorClausula:[ [{tipo:"circulo",id:"c1"}], [{tipo:"segmento",de:"A",a:"C"},{tipo:"segmento",de:"A",a:"B"}] ] },
    { texto:"de igual modo, {{el punto [[B]] es el centro de la otra circunferencia}}, así que {{el segmento [[B]][[C]] es igual al segmento [[B]][[A]]}} [Def. 15];",
      resaltaPorClausula:[ [{tipo:"circulo",id:"c2"}], [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"B",a:"A"}] ] },
    { texto:"Ya sabemos que {{[[C]][[A]] es igual a [[A]][[B]]}}; entonces {{tanto [[C]][[A]] como [[C]][[B]] son iguales a [[A]][[B]]}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"C",a:"A"},{tipo:"segmento",de:"A",a:"B"}], [{tipo:"segmento",de:"C",a:"A"},{tipo:"segmento",de:"C",a:"B"},{tipo:"segmento",de:"A",a:"B"}] ] },
    { texto:"Y dos cosas iguales a una tercera son iguales entre sí [N.C. 1]. Por tanto {{[[C]][[A]] es también igual a [[C]][[B]]}}: {{los tres segmentos [[A]][[B]], [[A]][[C]] y [[B]][[C]] son iguales entre sí}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"C",a:"A"},{tipo:"segmento",de:"C",a:"B"}], [{tipo:"triangulo",puntos:["A","B","C"]}] ] },
    { texto:"Por consiguiente, {{el triángulo [[A]][[B]][[C]] es equilátero}} y ha sido construido sobre la recta dada AB. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]}] ] }
  ]
},

2: {
  tipo: "construccion",
  numeroRomano: "II",
  titulo: "Poner en un punto dado (como extremo) una recta igual a una recta dada.",
  enunciado: "Sea [[A]] el punto dado y [[B]][[C]] la recta dada. Así pues, hay que poner en el punto A una recta igual a la recta dada BC.",
  puntosDados: { A:{x:0,y:-150}, B:{x:-80,y:120}, C:{x:80,y:120} },
  segmentosDados: [ {id:"BC", de:"B", a:"C"} ],
  pasos: [
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"A", radioHasta:"B",
      instruccion:"Como en I.1: traza una circunferencia con centro en A que pase por B." },
    { tipo:"circulo", herramienta:"circulo", id:"c2", centro:"B", radioHasta:"A",
      instruccion:"Traza una circunferencia con centro en B que pase por A." },
    { tipo:"interseccion", herramienta:"punto", id:"D", obj1:"c1", obj2:"c2", cual:"arriba",
      instruccion:"Marca el punto D donde se cortan: el triángulo ABD es equilátero." },
    { tipo:"segmento", herramienta:"segmento", id:"AD", de:"A", a:"D",
      instruccion:"Traza el segmento AD." },
    { tipo:"recta", herramienta:"recta", id:"BD", de:"D", a:"B", extender:true,
      instruccion:"Traza la recta DB y prolóngala más allá de B." },
    { tipo:"circulo", herramienta:"circulo", id:"c3", centro:"B", radioHasta:"C",
      instruccion:"Traza una circunferencia con centro en B que pase por C." },
    { tipo:"interseccion", herramienta:"punto", id:"G", obj1:"c3", obj2:"BD", cual:"masAlla:D,B",
      instruccion:"Marca el punto G donde esa circunferencia corta la prolongación de DB." },
    { tipo:"recta", herramienta:"recta", id:"DA", de:"D", a:"A", extender:true,
      instruccion:"Traza la recta DA y prolóngala más allá de A." },
    { tipo:"circulo", herramienta:"circulo", id:"c4", centro:"D", radioHasta:"G",
      instruccion:"Traza una circunferencia con centro en D que pase por G." },
    { tipo:"interseccion", herramienta:"punto", id:"L", obj1:"c4", obj2:"DA", cual:"masAlla:D,A",
      instruccion:"Marca el punto L donde esa circunferencia corta la prolongación de DA." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__AL_BC__"] }
  ],
  demostracion: [
    { texto:"{{El punto [[B]] es el centro de la circunferencia que pasa por [[C]] y [[G]]}}, así que {{el segmento [[B]][[C]] es igual al segmento [[B]][[G]]}}.",
      resaltaPorClausula:[ [{tipo:"circulo",id:"c3"}], [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"B",a:"G"}] ] },
    { texto:"Del mismo modo, {{el punto [[D]] es el centro de la circunferencia que pasa por [[G]] y [[L]]}}, así que {{el segmento [[D]][[L]] es igual al segmento [[D]][[G]]}}, cuyas partes [[D]][[A]] y [[D]][[B]] son iguales.",
      resaltaPorClausula:[ [{tipo:"circulo",id:"c4"}], [{tipo:"segmento",de:"D",a:"L"},{tipo:"segmento",de:"D",a:"G"}] ] },
    { texto:"Luego {{la parte restante [[A]][[L]] es igual a la parte restante [[B]][[G]]}} [N.C. 3].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"L"},{tipo:"segmento",de:"B",a:"G"}] ] },
    { texto:"Pero ya vimos que {{[[B]][[C]] es igual a [[B]][[G]]}}; por tanto, {{cada uno de los segmentos [[A]][[L]] y [[B]][[C]] es igual a [[B]][[G]]}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"B",a:"G"}], [{tipo:"segmento",de:"A",a:"L"},{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"B",a:"G"}] ] },
    { texto:"Las cosas iguales a una misma cosa son iguales entre sí [N.C. 1]. Luego {{[[A]][[L]] es también igual a [[B]][[C]]}}. Por consiguiente, en el punto dado A se ha puesto un segmento igual al segmento dado BC. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"L"},{tipo:"segmento",de:"B",a:"C"}] ] }
  ]
},

3: {
  tipo: "construccion",
  numeroRomano: "III",
  titulo: "Dadas dos rectas desiguales, quitar de la mayor una recta igual a la menor.",
  enunciado: "Sean [[A]][[B]] y [[C]][[D]] las dos rectas desiguales dadas, siendo AB la mayor. Así pues, hay que quitar de la mayor AB una recta igual a la menor CD.",
  puntosDados: { A:{x:-180,y:0}, B:{x:170,y:0}, C:{x:210,y:115}, D:{x:265,y:135} },
  segmentosDados: [ {id:"AB", de:"A", a:"B"}, {id:"CD", de:"C", a:"D"} ],
  pasos: [
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"A", radioHasta:"C",
      instruccion:"Como en I.1: traza una circunferencia con centro en A que pase por C." },
    { tipo:"circulo", herramienta:"circulo", id:"c2", centro:"C", radioHasta:"A",
      instruccion:"Traza una circunferencia con centro en C que pase por A." },
    { tipo:"interseccion", herramienta:"punto", id:"X", obj1:"c1", obj2:"c2", cual:"arriba",
      instruccion:"Marca el punto X donde se cortan: el triángulo ACX es equilátero." },
    { tipo:"recta", herramienta:"recta", id:"XC", de:"X", a:"C", extender:true,
      instruccion:"Traza la recta XC y prolóngala más allá de C." },
    { tipo:"circulo", herramienta:"circulo", id:"c3", centro:"C", radioHasta:"D",
      instruccion:"Traza una circunferencia con centro en C que pase por D." },
    { tipo:"interseccion", herramienta:"punto", id:"G", obj1:"c3", obj2:"XC", cual:"masAlla:X,C",
      instruccion:"Marca el punto G donde esa circunferencia corta la prolongación de XC." },
    { tipo:"recta", herramienta:"recta", id:"XA", de:"X", a:"A", extender:true,
      instruccion:"Traza la recta XA y prolóngala más allá de A." },
    { tipo:"circulo", herramienta:"circulo", id:"c4", centro:"X", radioHasta:"G",
      instruccion:"Traza una circunferencia con centro en X que pase por G." },
    { tipo:"interseccion", herramienta:"punto", id:"E", obj1:"c4", obj2:"XA", cual:"masAlla:X,A",
      instruccion:"Marca el punto E donde esa circunferencia corta la prolongación de XA: AE queda igual a CD." },
    { tipo:"circulo", herramienta:"circulo", id:"c5", centro:"A", radioHasta:"E",
      instruccion:"Traza una circunferencia con centro en A que pase por E." },
    { tipo:"interseccion", herramienta:"punto", id:"F", obj1:"c5", obj2:"AB", cual:"entre:A,B",
      instruccion:"Marca el punto F donde esa circunferencia corta el segmento AB." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__AF_CD__"] }
  ],
  demostracion: [
    { texto:"{{El punto [[A]] es el centro de la circunferencia que pasa por [[E]] y [[F]]}}, así que {{el segmento [[A]][[F]] es igual al segmento [[A]][[E]]}};",
      resaltaPorClausula:[ [{tipo:"circulo",id:"c5"}], [{tipo:"segmento",de:"A",a:"F"},{tipo:"segmento",de:"A",a:"E"}] ] },
    { texto:"pero también {{[[C]][[D]] es igual a [[A]][[E]]}}; de modo que también {{[[A]][[F]] es igual a [[C]][[D]]}} [N.C. 1].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"C",a:"D"},{tipo:"segmento",de:"A",a:"E"}], [{tipo:"segmento",de:"A",a:"F"},{tipo:"segmento",de:"C",a:"D"}] ] },
    { texto:"Por consiguiente, dadas las dos rectas desiguales AB y CD, se ha quitado de la mayor AB {{un segmento [[A]][[F]] igual a la menor [[C]][[D]]}}. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"F"},{tipo:"segmento",de:"C",a:"D"}] ] }
  ]
},

4: {
  tipo: "demostracion",
  numeroRomano: "IV",
  titulo: "Si dos triángulos tienen dos lados del uno iguales a dos lados del otro y tienen iguales los ángulos comprendidos, tendrán también las bases iguales, y los triángulos serán iguales, y los ángulos restantes también, respectivamente.",
  enunciado: "Sean [[A]][[B]][[C]] y [[D]][[E]][[F]] dos triángulos que tienen los lados AB y AC iguales a DE y DF respectivamente, y el ángulo BAC igual al ángulo EDF.",
  figuraInicial: {
    A:{x:-220,y:-40}, B:{x:-100,y:90}, C:{x:-60,y:-70},
    D:{x:90,y:-40}, E:{x:71.53,y:135.95}, F:{x:218.14,y:60.41}
  },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"D",a:"E"},{de:"D",a:"F"} ],
  superposicion: { origen:["A","B","C"], destino:["D","E","F"] },
  demostracion: [
    { texto:"Digo que {{también la base [[B]][[C]] es igual a la base [[E]][[F]]}} y que {{el triángulo [[A]][[B]][[C]] será igual al triángulo [[D]][[E]][[F]]}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"E",a:"F"}], [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","E","F"]}] ] },
    { texto:"Imaginemos que se levanta {{el triángulo [[A]][[B]][[C]]}} y se coloca sobre {{el triángulo [[D]][[E]][[F]]}}, haciendo coincidir A con D y el segmento AB con DE: como AB es igual a DE, también coincidirá B con E.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"segmento",de:"A",a:"B"}], [{tipo:"triangulo",puntos:["D","E","F"]},{tipo:"segmento",de:"D",a:"E"}] ], accion:"superponer_parcial_1" },
    { texto:"Y como {{el ángulo BAC}} es igual a {{el ángulo EDF}}, al coincidir AB con DE también coincidirá AC con DF — y por ser AC igual a DF, el punto C coincidirá con el punto F.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"}], [{tipo:"angulo",vertice:"D",r1:"E",r2:"F"}] ], accion:"superponer_parcial_2" },
    { texto:"(Si B coincidiera con E y C con F, pero {{la base [[B]][[C]]}} no coincidiera con {{la base [[E]][[F]]}}, dos rectas distintas encerrarían un espacio entre los mismos dos puntos — lo cual es imposible.)",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"C"}], [{tipo:"segmento",de:"E",a:"F"}] ] },
    { texto:"Por tanto, {{la base [[B]][[C]] coincide con la base [[E]][[F]] y es igual a ella}} [N.C. 4]; luego {{el triángulo entero ABC coincide con el triángulo entero DEF}} y es igual a él.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"E",a:"F"}], [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","E","F"]}] ], accion:"superponer_completo" },
    { texto:"Por consiguiente: dos triángulos con dos lados y el ángulo comprendido respectivamente iguales son congruentes — {{mismas bases, mismos ángulos restantes}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","E","F"]}] ] }
  ]
},

5: {
  tipo: "construccion",
  numeroRomano: "V",
  titulo: "En los triángulos isósceles los ángulos de la base son iguales entre sí, y prolongadas las dos rectas iguales, los ángulos situados bajo la base serán iguales entre sí.",
  enunciado: "Sea [[A]][[B]][[C]] el triángulo isósceles que tiene el lado AB igual al lado AC.",
  puntosDados: { A:{x:0,y:-190}, B:{x:-150,y:130}, C:{x:150,y:130} },
  segmentosDados: [ {id:"AB", de:"A", a:"B"}, {id:"AC", de:"A", a:"C"}, {id:"BC", de:"B", a:"C"} ],
  pasos: [
    { tipo:"recta", herramienta:"recta", id:"ABext", de:"A", a:"B", extender:true,
      instruccion:"Traza la recta AB y prolóngala más allá de B." },
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"B", radioHasta:"A",
      instruccion:"Traza una circunferencia con centro en B que pase por A." },
    { tipo:"interseccion", herramienta:"punto", id:"D", obj1:"c1", obj2:"ABext", cual:"masAlla:A,B",
      instruccion:"Marca el punto D donde esa circunferencia corta la prolongación: BD queda igual a AB." },
    { tipo:"recta", herramienta:"recta", id:"ACext", de:"A", a:"C", extender:true,
      instruccion:"Traza la recta AC y prolóngala más allá de C." },
    { tipo:"circulo", herramienta:"circulo", id:"c2", centro:"C", radioHasta:"A",
      instruccion:"Traza una circunferencia con centro en C que pase por A." },
    { tipo:"interseccion", herramienta:"punto", id:"E", obj1:"c2", obj2:"ACext", cual:"masAlla:A,C",
      instruccion:"Marca el punto E donde esa circunferencia corta la prolongación: CE queda igual a AC." },
    { tipo:"segmento", herramienta:"segmento", id:"BE", de:"B", a:"E",
      instruccion:"Traza el segmento BE." },
    { tipo:"segmento", herramienta:"segmento", id:"CD", de:"C", a:"D",
      instruccion:"Traza el segmento CD." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__ISOSCELES__"] }
  ],
  demostracion: [
    { texto:"Como A[[D]] es igual a A[[E]], y A[[B]] es igual a A[[C]], {{los segmentos [[D]]A y A[[C]]}} son respectivamente iguales a {{los segmentos [[E]]A y A[[B]]}}, y ambos pares comprenden el mismo ángulo DAC (= EAB, el ángulo del vértice A).",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["D","A","C"]}], [{tipo:"triangulo",puntos:["E","A","B"]}] ] },
    { texto:"Por tanto (criterio LAL [I,4]): {{la base [[D]][[C]] es igual a la base [[E]][[B]]}}, y {{el triángulo A[[D]][[C]] es igual al triángulo A[[E]][[B]]}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"D",a:"C"},{tipo:"segmento",de:"E",a:"B"}], [{tipo:"triangulo",puntos:["A","D","C"]},{tipo:"triangulo",puntos:["A","E","B"]}] ] },
    { texto:"Como {{el segmento entero A[[D]]}} es igual a {{el segmento entero A[[E]]}}, y sus partes AB y AC son iguales entre sí, lo que sobra también es igual: {{[[B]][[D]] es igual a [[C]][[E]]}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"D"}], [{tipo:"segmento",de:"A",a:"E"}], [{tipo:"segmento",de:"B",a:"D"},{tipo:"segmento",de:"C",a:"E"}] ] },
    { texto:"Ya vimos que {{[[D]][[C]] es igual a [[E]][[B]]}}. Entonces {{el triángulo [[B]][[D]][[C]]}} y {{el triángulo [[C]][[E]][[B]]}} tienen sus tres lados respectivamente iguales (BD=CE, DC=EB, y BC es base común), así que también son congruentes.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"D",a:"C"},{tipo:"segmento",de:"E",a:"B"}], [{tipo:"triangulo",puntos:["B","D","C"]}], [{tipo:"triangulo",puntos:["C","E","B"]}] ] },
    { texto:"El ángulo entero en B (hacia A y E) es igual al ángulo entero en C (hacia A y D); restando sus partes iguales, queda: {{el ángulo ABC es igual al ángulo ACB}} — son los ángulos de la base.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"},{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}] ] },
    { texto:"Y ya habíamos visto que {{el ángulo DBC es igual al ángulo ECB}}: son los situados debajo de la base. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"B",r1:"D",r2:"C"},{tipo:"angulo",vertice:"C",r1:"E",r2:"B"}] ] }
  ]
},

6: {
  tipo: "demostracion",
  numeroRomano: "VI",
  titulo: "Si dos ángulos de un triángulo son iguales entre sí, también los lados que subtienden a los ángulos iguales serán iguales entre sí.",
  enunciado: "Sea el triángulo [[A]][[B]][[C]] con el ángulo ABC igual al ángulo ACB. Digo que también el lado AB es igual al lado AC. <i>(Se demuestra por reducción al absurdo: el punto auxiliar que menciona el texto es puramente hipotético — imaginado para llegar a una contradicción — y por eso no se dibuja sobre esta figura, que ya es la isósceles real.)</i>",
  figuraInicial: { A:{x:0,y:-170}, B:{x:-160,y:130}, C:{x:160,y:130} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"} ],
  demostracion: [
    { texto:"Si {{AB no fuera igual al lado A[[C]]}}, uno de los dos sería mayor. Supongamos, para llegar a una contradicción, que {{AB es el mayor}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"A",a:"C"}], [{tipo:"segmento",de:"A",a:"B"}] ] },
    { texto:"Del lado mayor AB quitamos, solo para razonar, un segmento igual al lado menor AC [I,3]. Llamemos M al punto donde termina ese segmento (entre A y B), y tracemos MC. (M no se dibuja: es parte de la hipótesis que vamos a refutar.)",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"A",a:"C"}] ] },
    { texto:"Como MB sería igual a AC, y BC es un lado común, {{los dos lados MB y BC}} serían iguales a {{los dos lados AC y CB}}, con el mismo ángulo comprendido.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"C"}], [{tipo:"segmento",de:"A",a:"C"}] ] },
    { texto:"Por LAL [I,4], la base MC sería igual a la base AB, y {{el triángulo MBC sería igual al triángulo ACB}} — el menor igual al mayor. Eso es absurdo.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]}] ] },
    { texto:"Luego {{AB y A[[C]] no pueden ser desiguales}}: son iguales. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"A",a:"C"}] ] }
  ]
},

7: {
  tipo: "demostracion",
  numeroRomano: "VII",
  titulo: "No se podrán levantar sobre la misma recta otras dos rectas iguales respectivamente a dos rectas dadas, que se encuentren en dos puntos distintos por el mismo lado y con los mismos extremos.",
  enunciado: "Sea AB la recta dada. Supóngase, si es posible, que existen dos puntos distintos C y D, por el mismo lado de AB, tales que CA es igual a DA (mismo extremo en A) y CB es igual a DB (mismo extremo en B). <i>(Nota: la figura es esquemática — dibujar esta situación con exactitud geométrica es, precisamente, lo que la demostración muestra imposible.)</i>",
  figuraInicial: { A:{x:-180,y:60}, B:{x:180,y:60}, C:{x:-30,y:-150}, D:{x:40,y:-110} },
  segmentosInicial: [ {de:"A",a:"C"},{de:"B",a:"C"},{de:"A",a:"D"},{de:"B",a:"D"},{de:"C",a:"D"} ],
  demostracion: [
    { texto:"Tracemos {{el segmento [[C]][[D]]}} entre los dos puntos que supusimos distintos.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"C"},{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"B",a:"D"},{tipo:"segmento",de:"C",a:"D"}] ] },
    { texto:"Como A[[C]] es igual a A[[D]], por I.5 {{el ángulo ACD es igual al ángulo ADC}}. Por tanto, este último {{es mayor que el ángulo BDC}}.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"C",r1:"A",r2:"D"},{tipo:"angulo",vertice:"D",r1:"A",r2:"C"}], [{tipo:"angulo",vertice:"D",r1:"B",r2:"C"}] ] },
    { texto:"Con más razón, {{el ángulo BDC}} es mayor que {{el ángulo BCD}}. Pero como CB es igual a DB, ese mismo ángulo BCD debería ser igual al ángulo BDC — no mayor.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"D",r1:"C",r2:"B"}], [{tipo:"angulo",vertice:"C",r1:"D",r2:"B"}] ] },
    { texto:"Tenemos entonces que el mismo ángulo es a la vez mayor y igual, lo cual es imposible. Por consiguiente, no pueden existir dos puntos distintos como C y D en las condiciones supuestas. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"C",a:"D"}] ] }
  ]
},

8: {
  tipo: "demostracion",
  numeroRomano: "VIII",
  titulo: "Si dos triángulos tienen dos lados del uno respectivamente iguales a dos lados del otro y tienen también iguales sus bases respectivas, tendrán iguales los ángulos comprendidos por las rectas iguales.",
  enunciado: "Sean [[A]][[B]][[C]] y [[D]][[E]][[F]] dos triángulos que tienen los lados AB y AC iguales respectivamente a DF y DE, y la base BC igual a la base FE.",
  figuraInicial: {
    A:{x:-230,y:-50}, B:{x:-100,y:100}, C:{x:-50,y:-90},
    D:{x:350,y:20}, E:{x:467.3,y:162.27}, F:{x:275.29,y:203.9}
  },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"D",a:"E"},{de:"D",a:"F"},{de:"E",a:"F"} ],
  superposicion: { origen:["A","B","C"], destino:["D","F","E"] },
  demostracion: [
    { texto:"Digo que el ángulo BAC es también igual al ángulo FDE. Imaginemos {{el triángulo [[A]][[B]][[C]]}} superpuesto sobre {{el triángulo [[D]][[F]][[E]]}}, con B sobre F y BC sobre FE.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]}], [{tipo:"triangulo",puntos:["D","F","E"]}] ], accion:"superponer_parcial_1" },
    { texto:"Como BC es igual a FE, {{el punto C coincidirá con el punto E}}; y al coincidir BC con FE, también {{BA y CA coincidirán con FD y ED}} — o eso parece, salvo que se desvíen.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"F",a:"E"}], [{tipo:"segmento",de:"B",a:"A"},{tipo:"segmento",de:"C",a:"A"}] ], accion:"superponer_parcial_2" },
    { texto:"Si los lados BA y CA se desviaran de FD y ED, existirían dos triángulos distintos con la misma base y los mismos lados — eso es justo lo que I.7 demostró imposible.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["D","F","E"]}] ] },
    { texto:"Por tanto, los lados no pueden desviarse: {{coinciden exactamente}}, y con ellos también {{coincide el ángulo BAC con el ángulo FDE}}, que resultan iguales.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"A"},{tipo:"segmento",de:"C",a:"A"}], [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"},{tipo:"angulo",vertice:"D",r1:"F",r2:"E"}] ], accion:"superponer_completo" },
    { texto:"Por consiguiente: dos triángulos con los tres lados respectivamente iguales tienen también {{sus ángulos correspondientes iguales}} (criterio LLL). Q.E.D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","F","E"]}] ] }
  ]
},

9: {
  tipo: "construccion",
  numeroRomano: "IX",
  titulo: "Dividir en dos partes iguales un ángulo rectilíneo dado.",
  enunciado: "Sea B[[A]]C el ángulo rectilíneo dado. Así pues, hay que dividirlo en dos partes iguales.",
  puntosDados: { A:{x:0,y:0}, B:{x:210,y:-30}, C:{x:170,y:150}, D:{x:115.5,y:-16.5} },
  segmentosDados: [ {id:"AB", de:"A", a:"B"}, {id:"AC", de:"A", a:"C"} ],
  notaPuntoDado: "Euclides toma «al azar» un punto sobre AB; aquí se llama D y se da fijo, para que la construcción sea reproducible.",
  pasos: [
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"A", radioHasta:"D",
      instruccion:"Traza una circunferencia con centro en A que pase por D." },
    { tipo:"interseccion", herramienta:"punto", id:"E", obj1:"c1", obj2:"AC", cual:"entre:A,C",
      instruccion:"Marca el punto E sobre AC, donde lo corta esa circunferencia: AE queda igual a AD." },
    { tipo:"circulo", herramienta:"circulo", id:"c2", centro:"D", radioHasta:"E",
      instruccion:"Traza una circunferencia con centro en D que pase por E." },
    { tipo:"circulo", herramienta:"circulo", id:"c3", centro:"E", radioHasta:"D",
      instruccion:"Traza una circunferencia con centro en E que pase por D." },
    { tipo:"interseccion", herramienta:"punto", id:"Z", obj1:"c2", obj2:"c3", cual:"lejana:A",
      instruccion:"Marca el punto Z donde se cortan, del lado opuesto a A: el triángulo DEZ es equilátero." },
    { tipo:"recta", herramienta:"recta", id:"AZ", de:"A", a:"Z",
      instruccion:"Traza la recta AZ." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__BISECTRIZ__"] }
  ],
  demostracion: [
    { texto:"Digo que el ángulo BAC queda dividido en dos partes iguales por la recta A[[Z]]. Por construcción, {{el segmento A[[D]] es igual al segmento A[[E]]}}, y AZ es un lado común a los dos triángulos ADZ y AEZ.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"A",a:"E"}] ] },
    { texto:"Además, como {{el triángulo DEZ}} es equilátero (así se construyó), también {{el segmento DZ es igual al segmento EZ}}. Luego {{el triángulo A[[D]][[Z]]}} y {{el triángulo A[[E]][[Z]]}} tienen sus tres lados respectivamente iguales.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["D","E","Z"]}], [{tipo:"segmento",de:"D",a:"Z"},{tipo:"segmento",de:"E",a:"Z"}], [{tipo:"triangulo",puntos:["A","D","Z"]}], [{tipo:"triangulo",puntos:["A","E","Z"]}] ] },
    { texto:"Por LLL [I,8], {{el ángulo DAZ}} es igual {{al ángulo EAZ}}. Por consiguiente, el ángulo BAC ha quedado dividido en dos partes iguales por la recta AZ. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"D",r2:"Z"}], [{tipo:"angulo",vertice:"A",r1:"E",r2:"Z"}] ] }
  ]
},

10: {
  tipo: "construccion",
  numeroRomano: "X",
  titulo: "Dividir en dos partes iguales una recta finita dada.",
  enunciado: "Sea [[A]][[B]] la recta finita dada. Así pues, hay que dividir en dos partes iguales la recta finita AB.",
  puntosDados: { A:{x:-140,y:70}, B:{x:140,y:70} },
  segmentosDados: [ {id:"AB", de:"A", a:"B"} ],
  notaPuntoDado: "El punto D se toma «al azar» sobre GA (G es el vértice del triángulo equilátero), según el método de I.9.",
  pasos: [
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"A", radioHasta:"B",
      instruccion:"Como en I.1: traza una circunferencia con centro en A que pase por B." },
    { tipo:"circulo", herramienta:"circulo", id:"c2", centro:"B", radioHasta:"A",
      instruccion:"Traza una circunferencia con centro en B que pase por A." },
    { tipo:"interseccion", herramienta:"punto", id:"G", obj1:"c1", obj2:"c2", cual:"arriba",
      instruccion:"Marca el punto G donde se cortan: el triángulo ABG es equilátero." },
    { tipo:"segmento", herramienta:"segmento", id:"AG", de:"A", a:"G",
      instruccion:"Traza el segmento AG." },
    { tipo:"segmento", herramienta:"segmento", id:"BG", de:"B", a:"G",
      instruccion:"Traza el segmento BG." },
    { tipo:"puntoEnSegmento", herramienta:"punto", id:"D", de:"G", a:"A", fraccion:0.4,
      instruccion:"Se toma un punto D sobre GA (al azar, según el método de I.9)." },
    { tipo:"circulo", herramienta:"circulo", id:"c3", centro:"G", radioHasta:"D",
      instruccion:"Como en I.9: traza una circunferencia con centro en G que pase por D." },
    { tipo:"interseccion", herramienta:"punto", id:"E", obj1:"c3", obj2:"BG", cual:"entre:G,B",
      instruccion:"Marca el punto E sobre GB, donde lo corta esa circunferencia: GE queda igual a GD." },
    { tipo:"circulo", herramienta:"circulo", id:"c4", centro:"D", radioHasta:"E",
      instruccion:"Traza una circunferencia con centro en D que pase por E." },
    { tipo:"circulo", herramienta:"circulo", id:"c5", centro:"E", radioHasta:"D",
      instruccion:"Traza una circunferencia con centro en E que pase por D." },
    { tipo:"interseccion", herramienta:"punto", id:"Z", obj1:"c4", obj2:"c5", cual:"lejana:G",
      instruccion:"Marca el punto Z donde se cortan: el triángulo DEZ es equilátero." },
    { tipo:"recta", herramienta:"recta", id:"GZ", de:"G", a:"Z",
      instruccion:"Traza la recta GZ." },
    { tipo:"interseccion", herramienta:"punto", id:"M", obj1:"GZ", obj2:"AB", cual:"entre:A,B",
      instruccion:"Marca el punto M donde GZ corta al segmento AB." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__BISECCION_SEGMENTO__"] }
  ],
  demostracion: [
    { texto:"Digo que AB queda dividida en dos partes iguales en el punto [[M]]. En efecto: {{el segmento A[[G]] es igual al segmento [[G]]B}}, y GM es un lado común a los dos triángulos AGM y BGM.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"G"},{tipo:"segmento",de:"G",a:"B"}] ] },
    { texto:"Como por I.9 {{el ángulo AGM}} es igual {{al ángulo BGM}} (GM es la bisectriz), {{el triángulo A[[G]][[M]]}} y {{el triángulo B[[G]][[M]]}} tienen dos lados y el ángulo comprendido respectivamente iguales.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"G",r1:"A",r2:"M"}], [{tipo:"angulo",vertice:"G",r1:"B",r2:"M"}], [{tipo:"triangulo",puntos:["A","G","M"]}], [{tipo:"triangulo",puntos:["B","G","M"]}] ] },
    { texto:"Por LAL [I,4], {{la base A[[M]] es igual a la base B[[M]]}}. Por consiguiente, la recta dada AB ha quedado dividida en dos partes iguales en el punto M. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"M"},{tipo:"segmento",de:"B",a:"M"}] ] }
  ]
},

11: {
  tipo: "construccion",
  numeroRomano: "XI",
  titulo: "Trazar una línea recta que forme ángulos rectos con una recta dada, desde un punto dado en ella.",
  enunciado: "Sea [[A]][[B]] la recta dada y [[C]] el punto dado en ella. Hay que trazar desde C una recta que forme ángulos rectos con AB.",
  puntosDados: { A:{x:-200,y:80}, B:{x:200,y:80}, C:{x:-30,y:80}, D:{x:-130,y:80} },
  segmentosDados: [ {id:"AB", de:"A", a:"B"} ],
  notaPuntoDado: "El punto D se toma «al azar» sobre CA; aquí se da fijo para que la construcción sea reproducible.",
  pasos: [
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"C", radioHasta:"D",
      instruccion:"Traza una circunferencia con centro en C que pase por D." },
    { tipo:"interseccion", herramienta:"punto", id:"E", obj1:"c1", obj2:"AB", cual:"entre:C,B",
      instruccion:"Marca el punto E sobre CB, donde la corta esa circunferencia: CE queda igual a CD." },
    { tipo:"circulo", herramienta:"circulo", id:"c2", centro:"D", radioHasta:"E",
      instruccion:"Traza una circunferencia con centro en D que pase por E." },
    { tipo:"circulo", herramienta:"circulo", id:"c3", centro:"E", radioHasta:"D",
      instruccion:"Traza una circunferencia con centro en E que pase por D." },
    { tipo:"interseccion", herramienta:"punto", id:"Z", obj1:"c2", obj2:"c3", cual:"lejana:C",
      instruccion:"Marca el punto Z donde se cortan: el triángulo DEZ es equilátero." },
    { tipo:"segmento", herramienta:"segmento", id:"ZC", de:"Z", a:"C",
      instruccion:"Traza el segmento ZC." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__PERPENDICULAR_EN_PUNTO__"] }
  ],
  demostracion: [
    { texto:"Como {{el segmento DC es igual al segmento CE}}, y CZ es un lado común a los triángulos DCZ y ECZ,",
      resaltaPorClausula:[ [{tipo:"segmento",de:"D",a:"C"},{tipo:"segmento",de:"C",a:"E"}] ] },
    { texto:"y además {{la base DZ es igual a la base EZ}} (DEZ es equilátero), {{el triángulo D[[C]][[Z]]}} y {{el triángulo E[[C]][[Z]]}} tienen sus tres lados respectivamente iguales.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"D",a:"Z"},{tipo:"segmento",de:"E",a:"Z"}], [{tipo:"triangulo",puntos:["D","C","Z"]}], [{tipo:"triangulo",puntos:["E","C","Z"]}] ] },
    { texto:"Por LLL [I,8], {{el ángulo DCZ es igual al ángulo ECZ}}. Como además son adyacentes y juntos forman una recta, [I,13] cada uno es recto.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"C",r1:"D",r2:"Z"},{tipo:"angulo",vertice:"C",r1:"E",r2:"Z"}] ] },
    { texto:"Por consiguiente, {{ZC forma ángulos rectos con AB}} en el punto C. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"Z",a:"C"}] ] }
  ]
},

12: {
  tipo: "construccion",
  numeroRomano: "XII",
  titulo: "Trazar una línea recta perpendicular a una recta infinita dada, desde un punto dado que no está en ella.",
  enunciado: "Sea [[A]][[B]] la recta infinita dada y [[C]] el punto dado, exterior a ella. Hay que trazar desde C una perpendicular a AB.",
  puntosDados: { A:{x:-160,y:50}, B:{x:160,y:50}, C:{x:40,y:-120}, D:{x:40,y:75} },
  segmentosDados: [ {id:"AB", de:"A", a:"B", extender:true} ],
  notaPuntoDado: "El punto D se toma «al azar» al otro lado de AB; aquí se da fijo, con CD mayor que la distancia de C a la recta, para garantizar el corte.",
  pasos: [
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"C", radioHasta:"D",
      instruccion:"Traza una circunferencia con centro en C que pase por D (su radio corta la recta AB en dos puntos)." },
    { tipo:"interseccion", herramienta:"punto", id:"H", obj1:"c1", obj2:"AB", cual:"izquierda",
      instruccion:"Marca el punto H, donde esa circunferencia corta AB (el de la izquierda)." },
    { tipo:"interseccion", herramienta:"punto", id:"E", obj1:"c1", obj2:"AB", cual:"derecha",
      instruccion:"Marca el punto E, donde esa circunferencia corta AB (el de la derecha)." },
    { tipo:"puntoEnSegmento", herramienta:"punto", id:"G", de:"H", a:"E", fraccion:0.5,
      instruccion:"Biseca el segmento HE (como en I.10): G es su punto medio." },
    { tipo:"segmento", herramienta:"segmento", id:"CG", de:"C", a:"G",
      instruccion:"Traza el segmento CG." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__PERPENDICULAR_EXTERIOR__"] }
  ],
  demostracion: [
    { texto:"Como {{HG es igual a GE}} (G es el punto medio) y GC es un lado común a los triángulos HGC y EGC,",
      resaltaPorClausula:[ [{tipo:"segmento",de:"H",a:"G"},{tipo:"segmento",de:"G",a:"E"}] ] },
    { texto:"y además {{CH es igual a CE}} (ambos son radios de la misma circunferencia), {{el triángulo H[[G]][[C]]}} y {{el triángulo E[[G]][[C]]}} tienen sus tres lados respectivamente iguales.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"C",a:"H"},{tipo:"segmento",de:"C",a:"E"}], [{tipo:"triangulo",puntos:["H","G","C"]}], [{tipo:"triangulo",puntos:["E","G","C"]}] ] },
    { texto:"Por LLL [I,8], {{el ángulo CGH es igual al ángulo CGE}}. Como son adyacentes y forman una recta, [I,13] cada uno es recto.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"G",r1:"C",r2:"H"},{tipo:"angulo",vertice:"G",r1:"C",r2:"E"}] ] },
    { texto:"Por consiguiente, {{CG es perpendicular a AB}} desde el punto C. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"C",a:"G"}] ] }
  ]
},

13: {
  tipo: "demostracion",
  numeroRomano: "XIII",
  titulo: "Si una recta levantada sobre otra forma ángulos, o bien forma dos rectos, o forma ángulos cuya suma es igual a dos rectos.",
  enunciado: "Sea [[A]][[B]] una recta levantada sobre la recta [[C]][[D]], formando los ángulos ABC y ABD. Digo que esos dos ángulos, juntos, son iguales a dos rectos.",
  figuraInicial: { C:{x:-150,y:80}, D:{x:150,y:80}, B:{x:0,y:80}, A:{x:60,y:-100}, E:{x:0,y:250} },
  segmentosInicial: [ {de:"C",a:"D"},{de:"B",a:"A"} ],
  demostracion: [
    { texto:"Si {{el ángulo ABC es igual al ángulo ABD}}, ambos son rectos [Def. 10] y su suma ya es dos rectos.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"},{tipo:"angulo",vertice:"B",r1:"A",r2:"D"}] ] },
    { texto:"Si no son iguales, consideremos {{la perpendicular BE a CD}} (un recurso auxiliar para la prueba). Entonces {{el ángulo CBE}} y {{el ángulo DBE}} son ambos rectos, y su suma también es dos rectos.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"E"}], [{tipo:"angulo",vertice:"B",r1:"C",r2:"E"}], [{tipo:"angulo",vertice:"B",r1:"D",r2:"E"}] ] },
    { texto:"Como {{el ángulo CBE}} es igual a {{los ángulos CBA y ABE juntos}}, y {{el ángulo DBE}} es igual a {{los ángulos DBA y ABE}} con signo opuesto según el lado de A, sumando ambos pares se obtiene el mismo total: {{el ángulo ABC más el ángulo ABD}} es igual a dos rectos.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"B",r1:"C",r2:"E"}], [{tipo:"angulo",vertice:"B",r1:"C",r2:"A"}], [{tipo:"angulo",vertice:"B",r1:"D",r2:"E"}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"},{tipo:"angulo",vertice:"B",r1:"A",r2:"D"}] ] },
    { texto:"Por consiguiente, los ángulos ABC y ABD, formados al levantar AB sobre CD, suman siempre dos rectos. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"},{tipo:"angulo",vertice:"B",r1:"A",r2:"D"}] ] }
  ]
},

14: {
  tipo: "demostracion",
  numeroRomano: "XIV",
  titulo: "Si con una recta y en un punto de ella, dos rectas (no situadas del mismo lado) forman ángulos adyacentes que suman dos rectos, esas dos rectas están en línea recta.",
  enunciado: "Sea AB una recta, y en el punto B, dos rectas BC y BD (en lados opuestos de AB) tales que el ángulo ABC más el ángulo ABD es igual a dos rectos. Digo que BD está en línea recta con BC.",
  figuraInicial: { A:{x:60,y:-100}, B:{x:0,y:80}, C:{x:-150,y:80}, D:{x:150,y:80} },
  segmentosInicial: [ {de:"B",a:"A"},{de:"B",a:"C"},{de:"B",a:"D"} ],
  demostracion: [
    { texto:"Supongamos, para llegar a una contradicción, que {{BD no estuviera en línea recta con BC}}, sino que lo estuviera otra recta BE distinta.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"D"},{tipo:"segmento",de:"B",a:"C"}] ] },
    { texto:"Como AB está levantada sobre la recta CBE (hipotética), {{el ángulo ABC más el ángulo ABE}} sería igual a dos rectos [I,13].",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"}] ] },
    { texto:"Pero por hipótesis {{el ángulo ABC más el ángulo ABD}} ya es igual a dos rectos. Comparando ambas sumas, {{el ángulo ABE sería igual al ángulo ABD}} — la parte igual al todo, lo cual es absurdo.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"B",r1:"A",r2:"D"}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"D"}] ] },
    { texto:"Por consiguiente, no existe tal recta BE distinta: {{BD está en línea recta con BC}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"D"},{tipo:"segmento",de:"B",a:"C"}] ] }
  ]
},

15: {
  tipo: "demostracion",
  numeroRomano: "XV",
  titulo: "Si dos rectas se cortan, los ángulos opuestos por el vértice son iguales entre sí.",
  enunciado: "Sean [[A]][[B]] y [[C]][[D]] dos rectas que se cortan en el punto [[E]]. Digo que el ángulo AEC es igual al ángulo BED, y el ángulo AED es igual al ángulo BEC.",
  figuraInicial: { E:{x:0,y:0}, A:{x:-150,y:-60}, B:{x:150,y:60}, C:{x:-100,y:90}, D:{x:100,y:-90} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"C",a:"D"} ],
  demostracion: [
    { texto:"Como AB está levantada sobre CD, {{el ángulo AEC más el ángulo AED}} es igual a dos rectos [I,13].",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"E",r1:"A",r2:"C"},{tipo:"angulo",vertice:"E",r1:"A",r2:"D"}] ] },
    { texto:"Y como CD está levantada sobre AB, {{el ángulo AED más el ángulo BED}} es igual también a dos rectos [I,13].",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"E",r1:"A",r2:"D"},{tipo:"angulo",vertice:"E",r1:"B",r2:"D"}] ] },
    { texto:"Ambas sumas son iguales a dos rectos, así que son iguales entre sí. Quitando de las dos el ángulo AED, que es común [N.C. 3], {{el ángulo AEC es igual al ángulo BED}}.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"E",r1:"A",r2:"C"},{tipo:"angulo",vertice:"E",r1:"B",r2:"D"}] ] },
    { texto:"Por el mismo argumento, {{el ángulo AED es igual al ángulo BEC}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"E",r1:"A",r2:"D"},{tipo:"angulo",vertice:"E",r1:"B",r2:"C"}] ] }
  ]
},

16: {
  tipo: "demostracion",
  numeroRomano: "XVI",
  titulo: "En todo triángulo, si se prolonga uno de los lados, el ángulo externo es mayor que cualquiera de los ángulos internos no adyacentes a él.",
  enunciado: "Sea [[A]][[B]][[C]] un triángulo, y prolónguese BC hasta D. Digo que el ángulo ACD (externo) es mayor que el ángulo ABC y que el ángulo BAC (los dos internos no adyacentes).",
  figuraInicial: { A:{x:-30,y:-150}, B:{x:-160,y:100}, C:{x:120,y:130}, D:{x:269.15,y:145.98}, E:{x:45,y:-10}, Z:{x:250,y:-120} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"D"},{de:"B",a:"Z"},{de:"Z",a:"C"} ],
  demostracion: [
    { texto:"Biséquese AC en {{el punto E}} [I,10], trácese {{BE}} y prolónguese hasta {{Z}}, de modo que EZ sea igual a BE [I,3].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"E"},{tipo:"segmento",de:"E",a:"C"}], [{tipo:"segmento",de:"B",a:"E"}], [{tipo:"segmento",de:"E",a:"Z"}] ] },
    { texto:"Como {{AE es igual a EC}} y {{BE es igual a EZ}}, con ángulos opuestos por el vértice AEB y CEZ iguales entre sí [I,15], {{el triángulo A[[E]]B}} es igual al triángulo {{C[[E]]Z}} por LAL [I,4].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"E"},{tipo:"segmento",de:"E",a:"C"}], [{tipo:"segmento",de:"B",a:"E"},{tipo:"segmento",de:"E",a:"Z"}], [{tipo:"triangulo",puntos:["A","E","B"]}] ] },
    { texto:"Por tanto {{el ángulo BAC (= EAB) es igual al ángulo ECZ}}. Pero el ángulo ACD (externo) es mayor que el ángulo ECZ, porque ECZ es solo una parte de él.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"},{tipo:"angulo",vertice:"C",r1:"E",r2:"Z"}] ] },
    { texto:"Luego {{el ángulo ACD es mayor que el ángulo BAC}}. Por un argumento análogo (bisecando BC en vez de AC), también {{el ángulo ACD es mayor que el ángulo ABC}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"}] ] }
  ]
},

17: {
  tipo: "demostracion",
  numeroRomano: "XVII",
  titulo: "En todo triángulo, dos ángulos tomados juntos de cualquier manera son menores que dos rectos.",
  enunciado: "Sea [[A]][[B]][[C]] un triángulo. Digo que dos cualesquiera de sus ángulos, sumados, son menores que dos rectos.",
  figuraInicial: { A:{x:-30,y:-150}, B:{x:-160,y:100}, C:{x:120,y:130}, D:{x:269.15,y:145.98} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"D"} ],
  demostracion: [
    { texto:"Prolónguese BC hasta D. Por I.16, {{el ángulo ACD (externo)}} es mayor que {{el ángulo BAC}} (interno no adyacente).",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"C",r1:"A",r2:"D"}], [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"}] ] },
    { texto:"Añadamos a ambos {{el ángulo ACB}} (el tercer ángulo del triángulo, adyacente a ACD): {{el ángulo ACD más el ángulo ACB}} es mayor que {{el ángulo BAC más el ángulo ACB}}.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}], [{tipo:"angulo",vertice:"C",r1:"A",r2:"D"},{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}], [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"},{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}] ] },
    { texto:"Pero {{el ángulo ACD más el ángulo ACB}} es igual a dos rectos [I,13], porque ACD y ACB son adyacentes sobre la recta BD.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"C",r1:"A",r2:"D"},{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}] ] },
    { texto:"Por tanto {{el ángulo BAC más el ángulo ACB}} es menor que dos rectos. El mismo argumento, aplicado a los otros lados, cubre cualquier par de ángulos del triángulo. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"},{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}] ] }
  ]
},

18: {
  tipo: "demostracion",
  numeroRomano: "XVIII",
  titulo: "En todo triángulo, el lado mayor subtiende el ángulo mayor.",
  enunciado: "Sea [[A]][[B]][[C]] un triángulo con AC mayor que AB. Digo que el ángulo ABC (opuesto a AC) es mayor que el ángulo ACB (opuesto a AB).",
  figuraInicial: { A:{x:-30,y:-150}, B:{x:-160,y:100}, C:{x:120,y:130}, D:{x:103.06,y:98.38} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"A",a:"D"} ],
  demostracion: [
    { texto:"Como AC es mayor que AB, marquemos sobre AC {{un punto D tal que AD sea igual a AB}} [I,3]; tracemos BD.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"D"}] ] },
    { texto:"Como {{el triángulo ABD}} es isósceles (AB=AD), {{el ángulo ABD es igual al ángulo ADB}} [I,5].",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","D"]}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"D"},{tipo:"angulo",vertice:"D",r1:"A",r2:"B"}] ] },
    { texto:"Pero {{el ángulo ADB (externo del triángulo BDC)}} es mayor que {{el ángulo DCB}} [I,16]. Y como ADB=ABD, también {{el ángulo ABD es mayor que el ángulo DCB (=ACB)}}.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"D",r1:"A",r2:"B"}], [{tipo:"angulo",vertice:"C",r1:"D",r2:"B"}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"D"},{tipo:"angulo",vertice:"C",r1:"D",r2:"B"}] ] },
    { texto:"Y como {{el ángulo ABC}} es mayor que {{su parte, el ángulo ABD}}, con más razón {{el ángulo ABC es mayor que el ángulo ACB}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"D"}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"},{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}] ] }
  ]
},

19: {
  tipo: "demostracion",
  numeroRomano: "XIX",
  titulo: "En todo triángulo, al ángulo mayor lo subtiende el lado mayor.",
  enunciado: "Sea [[A]][[B]][[C]] un triángulo con el ángulo ABC mayor que el ángulo ACB. Digo que AC (opuesto a ABC) es mayor que AB (opuesto a ACB).",
  figuraInicial: { A:{x:-30,y:-150}, B:{x:-160,y:100}, C:{x:120,y:130} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"} ],
  demostracion: [
    { texto:"Supongamos, para llegar a una contradicción, que {{AC no fuera mayor que AB}}: entonces AC sería igual a AB, o AC sería menor.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"C"},{tipo:"segmento",de:"A",a:"B"}] ] },
    { texto:"Si {{AC fuera igual a AB}}, el triángulo sería isósceles y {{el ángulo ABC sería igual al ángulo ACB}} [I,5] — contradice la hipótesis de que ABC es mayor.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"C"},{tipo:"segmento",de:"A",a:"B"}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"},{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}] ] },
    { texto:"Si {{AC fuera menor que AB}}, entonces por I.18 {{el ángulo ABC sería menor que el ángulo ACB}} — también contradice la hipótesis.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"C"},{tipo:"segmento",de:"A",a:"B"}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"},{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}] ] },
    { texto:"Ninguna de las dos alternativas es posible; luego {{AC es mayor que AB}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"C"},{tipo:"segmento",de:"A",a:"B"}] ] }
  ]
},

20: {
  tipo: "demostracion",
  numeroRomano: "XX",
  titulo: "En todo triángulo, dos lados tomados juntos de cualquier manera son mayores que el lado restante.",
  enunciado: "Sea [[A]][[B]][[C]] un triángulo. Digo que AB más BC es mayor que AC (y análogamente para las otras combinaciones).",
  figuraInicial: { A:{x:-30,y:-150}, B:{x:-160,y:100}, C:{x:120,y:130}, D:{x:-289.92,y:349.84} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"B",a:"D"},{de:"D",a:"C"} ],
  demostracion: [
    { texto:"Prolónguese AB más allá de B hasta {{un punto D tal que BD sea igual a BC}} [I,3]; trácese DC.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"D"}] ] },
    { texto:"Como {{el triángulo BDC}} es isósceles (BD=BC), {{el ángulo BDC es igual al ángulo BCD}} [I,5].",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["B","D","C"]}], [{tipo:"angulo",vertice:"D",r1:"B",r2:"C"},{tipo:"angulo",vertice:"C",r1:"B",r2:"D"}] ] },
    { texto:"Pero {{el ángulo ACD}} (que incluye a BCD como parte) es mayor que {{el ángulo BCD (=BDC=ADC)}}. Por I.19, al ángulo mayor lo subtiende el lado mayor: {{AD es mayor que AC}}.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"C",r1:"A",r2:"D"}], [{tipo:"angulo",vertice:"C",r1:"B",r2:"D"}], [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"A",a:"C"}] ] },
    { texto:"Y como AD es igual a AB más BD, es decir, {{AB más BC}}, queda demostrado que {{AB más BC es mayor que AC}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"B",a:"D"}], [{tipo:"segmento",de:"A",a:"C"}] ] }
  ]
},

21: {
  tipo: "demostracion",
  numeroRomano: "XXI",
  titulo: "Si a partir de los extremos de un lado de un triángulo se construyen dos rectas que se encuentran en su interior, esas rectas son menores que los otros dos lados, pero comprenden un ángulo mayor.",
  enunciado: "Sea [[A]][[B]][[C]] un triángulo, y desde B y C trácense dos rectas que se encuentren en un punto interior [[D]]. Digo que BD más DC es menor que BA más AC, y que el ángulo BDC es mayor que el ángulo BAC.",
  figuraInicial: { A:{x:-30,y:-150}, B:{x:-160,y:100}, C:{x:120,y:130}, D:{x:0,y:50}, E:{x:66.08,y:29.35} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"D"},{de:"C",a:"D"},{de:"D",a:"E"} ],
  demostracion: [
    { texto:"Prolónguese BD hasta encontrar AC en {{el punto E}}. Por I.20, en el triángulo ABE: {{AB más AE}} es mayor que {{BE}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"D"}], [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"A",a:"C"}] ] },
    { texto:"Añadiendo EC a ambos lados, {{AB más AC}} es mayor que {{BE más EC}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"A",a:"C"}], [{tipo:"segmento",de:"B",a:"D"},{tipo:"segmento",de:"D",a:"C"}] ] },
    { texto:"De nuevo por I.20, en el triángulo EDC: {{EC más ED}} es mayor que {{DC}}; sumando DB a ambos lados, {{BE más EC}} es mayor que {{BD más DC}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"D"},{tipo:"segmento",de:"D",a:"C"}], [{tipo:"segmento",de:"B",a:"D"},{tipo:"segmento",de:"D",a:"C"}] ] },
    { texto:"Combinando ambas desigualdades, {{AB más AC}} es mayor que {{BD más DC}}: los segmentos interiores son menores que los lados.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"A",a:"C"}], [{tipo:"segmento",de:"B",a:"D"},{tipo:"segmento",de:"D",a:"C"}] ] },
    { texto:"Por I.16, {{el ángulo BDC (externo del triángulo EDC)}} es mayor que {{el ángulo DEC}}; y por la misma razón {{el ángulo DEC}} es mayor que {{el ángulo BAC}}. Por tanto {{el ángulo BDC es mayor que el ángulo BAC}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"D",r1:"B",r2:"C"}], [{tipo:"angulo",vertice:"D",r1:"B",r2:"C"}], [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"}] ] }
  ]
},

22: {
  tipo: "construccion",
  numeroRomano: "XXII",
  titulo: "Construir un triángulo con tres rectas iguales a tres rectas dadas (siendo dos de ellas, juntas, siempre mayores que la restante).",
  enunciado: "Sean P, Q y R los tres segmentos dados (con la condición de que dos cualesquiera, juntos, superen al tercero). Sea además FG un segmento ya construido, igual a Q. Hay que construir un triángulo cuyos lados sean iguales a P, Q y R.",
  puntosDados: { P1:{x:-280,y:-180}, P2:{x:-280,y:-60}, Q1:{x:-280,y:20}, Q2:{x:-280,y:170}, R1:{x:-280,y:220}, R2:{x:-280,y:310}, F:{x:-100,y:80}, G:{x:50,y:80} },
  segmentosDados: [ {id:"P", de:"P1", a:"P2"}, {id:"Q", de:"Q1", a:"Q2"}, {id:"R", de:"R1", a:"R2"}, {id:"FG", de:"F", a:"G"} ],
  notaPuntoDado: "FG ya está construido con la misma longitud que Q (mediante I.3, repetido tres veces sobre una recta, como en el texto original); aquí se da listo para no repetir esa parte ya vista.",
  pasos: [
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"F", radioEntre:["P1","P2"],
      instruccion:"Traza una circunferencia con centro en F y radio igual a P (haz clic en P1 o P2 para fijar esa distancia)." },
    { tipo:"circulo", herramienta:"circulo", id:"c2", centro:"G", radioEntre:["R1","R2"],
      instruccion:"Traza una circunferencia con centro en G y radio igual a R (haz clic en R1 o R2 para fijar esa distancia)." },
    { tipo:"interseccion", herramienta:"punto", id:"K", obj1:"c1", obj2:"c2", cual:"arriba",
      instruccion:"Marca el punto K donde se cortan: el triángulo FGK tiene los lados pedidos." },
    { tipo:"segmento", herramienta:"segmento", id:"FK", de:"F", a:"K",
      instruccion:"Traza el segmento FK." },
    { tipo:"segmento", herramienta:"segmento", id:"GK", de:"G", a:"K",
      instruccion:"Traza el segmento GK." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__TRIANGULO_TRES_LADOS__"] }
  ],
  demostracion: [
    { texto:"Como {{el punto F es el centro de la circunferencia que pasa por K y P2}}, {{el segmento FK es igual al segmento P}} [Def. 15].",
      resaltaPorClausula:[ [{tipo:"circulo",id:"c1"}], [{tipo:"segmento",de:"F",a:"K"}] ] },
    { texto:"Y como {{el punto G es el centro de la otra circunferencia}}, {{el segmento GK es igual al segmento R}} [Def. 15].",
      resaltaPorClausula:[ [{tipo:"circulo",id:"c2"}], [{tipo:"segmento",de:"G",a:"K"}] ] },
    { texto:"Y por construcción, {{FG ya es igual a Q}}. Por consiguiente, {{el triángulo FGK tiene sus tres lados iguales a los tres segmentos dados P, Q y R}}. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"F",a:"G"}], [{tipo:"triangulo",puntos:["F","G","K"]}] ] }
  ]
},

23: {
  tipo: "construccion",
  numeroRomano: "XXIII",
  titulo: "Construir, sobre una recta dada y en un punto de ella, un ángulo rectilíneo igual a un ángulo rectilíneo dado.",
  enunciado: "Sea [[A]][[B]] la recta dada, [[A]] el punto en ella, y [[D]][[C]][[E]] el ángulo dado (con vértice en C). Hay que construir en A un ángulo igual al ángulo DCE.",
  puntosDados: { A:{x:-150,y:150}, B:{x:150,y:150}, C:{x:0,y:0}, D:{x:150,y:-60}, E:{x:130,y:90} },
  segmentosDados: [ {id:"AB", de:"A", a:"B"}, {id:"CD", de:"C", a:"D"}, {id:"CE", de:"C", a:"E"} ],
  pasos: [
    { tipo:"segmento", herramienta:"segmento", id:"DE", de:"D", a:"E",
      instruccion:"Traza el segmento DE." },
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"A", radioEntre:["C","D"],
      instruccion:"Traza una circunferencia con centro en A y radio igual a CD (haz clic en C o en D)." },
    { tipo:"interseccion", herramienta:"punto", id:"F", obj1:"c1", obj2:"AB", cual:"entre:A,B",
      instruccion:"Marca el punto F sobre AB, donde lo corta esa circunferencia: AF queda igual a CD." },
    { tipo:"circulo", herramienta:"circulo", id:"c2", centro:"A", radioEntre:["C","E"],
      instruccion:"Traza una circunferencia con centro en A y radio igual a CE (haz clic en C o en E)." },
    { tipo:"circulo", herramienta:"circulo", id:"c3", centro:"F", radioEntre:["D","E"],
      instruccion:"Traza una circunferencia con centro en F y radio igual a DE (haz clic en D o en E para fijar esa distancia)." },
    { tipo:"interseccion", herramienta:"punto", id:"G", obj1:"c2", obj2:"c3", cual:"arriba",
      instruccion:"Marca el punto G donde se cortan: el ángulo FAG queda igual al ángulo DCE." },
    { tipo:"segmento", herramienta:"segmento", id:"AG", de:"A", a:"G",
      instruccion:"Traza el segmento AG." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__ANGULO_COPIADO__"] }
  ],
  demostracion: [
    { texto:"Por construcción, {{AF es igual a CD}}, {{AG es igual a CE}}, y {{FG es igual a DE}} (los tres lados del triángulo AFG coinciden con los de CDE).",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"F"},{tipo:"segmento",de:"C",a:"D"}], [{tipo:"segmento",de:"A",a:"G"},{tipo:"segmento",de:"C",a:"E"}], [{tipo:"segmento",de:"F",a:"G"},{tipo:"segmento",de:"D",a:"E"}] ] },
    { texto:"Por LLL [I,8], {{el triángulo AFG es congruente con el triángulo CDE}}; por tanto {{el ángulo FAG es igual al ángulo DCE}}. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","F","G"]},{tipo:"triangulo",puntos:["C","D","E"]}], [{tipo:"angulo",vertice:"A",r1:"F",r2:"G"},{tipo:"angulo",vertice:"C",r1:"D",r2:"E"}] ] }
  ]
},

24: {
  tipo: "demostracion",
  numeroRomano: "XXIV",
  titulo: "Si dos triángulos tienen dos lados respectivamente iguales, pero uno tiene el ángulo comprendido mayor que el otro, también tiene la base mayor.",
  enunciado: "Sean [[A]][[B]][[C]] y [[D]][[E]][[F]] dos triángulos con AB igual a DE y AC igual a DF, pero el ángulo EDF mayor que el ángulo BAC. Digo que EF es mayor que BC.",
  figuraInicial: { A:{x:0,y:0}, B:{x:-150,y:80}, C:{x:140,y:60}, D:{x:300,y:0}, E:{x:130,y:0}, F:{x:430.19,y:79.07}, G:{x:395.30,y:118.83} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"D",a:"E"},{de:"D",a:"F"},{de:"E",a:"F"},{de:"D",a:"G"},{de:"E",a:"G"},{de:"F",a:"G"} ],
  demostracion: [
    { texto:"Como {{el ángulo EDF}} es mayor que {{el ángulo BAC}}, copiemos sobre DE, en el punto D, un ángulo EDG igual al ángulo BAC [I,23], con {{G}} tal que DG sea igual a AC (=DF).",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"D",r1:"E",r2:"F"}], [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"}] ] },
    { texto:"Entonces {{el triángulo ABC}} y {{el triángulo DEG}} tienen dos lados respectivamente iguales (AB=DE, AC=DG) y el mismo ángulo comprendido; por LAL [I,4], {{EG es igual a BC}}.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]}], [{tipo:"triangulo",puntos:["D","E","G"]}], [{tipo:"segmento",de:"E",a:"G"}] ] },
    { texto:"Como DF es igual a DG, {{el triángulo DGF es isósceles}}, así que {{el ángulo DGF es igual al ángulo DFG}} [I,5]; y como el ángulo DGF es mayor que el ángulo EGF, {{el ángulo DFG es mayor que el ángulo EGF}}, y mucho más mayor que el ángulo EFG.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["D","G","F"]}], [{tipo:"angulo",vertice:"G",r1:"D",r2:"F"}] ] },
    { texto:"Como {{el ángulo EFG es mayor que el ángulo EGF}} (en el triángulo EFG), por I.19 {{el lado EG es menor que el lado EF}}. Y como EG es igual a BC, {{BC es menor que EF}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"F",r1:"E",r2:"G"}], [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"E",a:"F"}] ] }
  ]
},

25: {
  tipo: "demostracion",
  numeroRomano: "XXV",
  titulo: "Si dos triángulos tienen dos lados respectivamente iguales, pero la base de uno es mayor que la del otro, también el ángulo comprendido por los lados iguales del primero es mayor.",
  enunciado: "Sean [[A]][[B]][[C]] y [[D]][[E]][[F]] dos triángulos con AB igual a DE y AC igual a DF, pero BC mayor que EF. Digo que el ángulo BAC es mayor que el ángulo EDF.",
  figuraInicial: { A:{x:0,y:0}, B:{x:-150,y:80}, C:{x:140,y:60}, D:{x:300,y:0}, E:{x:130,y:0}, F:{x:430.19,y:79.07} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"D",a:"E"},{de:"D",a:"F"},{de:"E",a:"F"} ],
  demostracion: [
    { texto:"Supongamos, para llegar a una contradicción, que {{el ángulo BAC no fuera mayor que el ángulo EDF}}: sería igual, o sería menor.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"},{tipo:"angulo",vertice:"D",r1:"E",r2:"F"}] ] },
    { texto:"Si {{el ángulo BAC fuera igual al ángulo EDF}}, por LAL [I,4] la base BC sería igual a EF — contradice que BC es mayor.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"},{tipo:"angulo",vertice:"D",r1:"E",r2:"F"}] ] },
    { texto:"Si {{el ángulo BAC fuera menor que el ángulo EDF}}, por I.24 {{BC sería menor que EF}} — también contradice la hipótesis.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"},{tipo:"angulo",vertice:"D",r1:"E",r2:"F"}], [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"E",a:"F"}] ] },
    { texto:"Ninguna de las dos alternativas es posible; luego {{el ángulo BAC es mayor que el ángulo EDF}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"},{tipo:"angulo",vertice:"D",r1:"E",r2:"F"}] ] }
  ]
},

26: {
  tipo: "demostracion",
  numeroRomano: "XXVI",
  titulo: "Si dos triángulos tienen dos ángulos respectivamente iguales y un lado igual —el común a esos ángulos (ALA), o el opuesto a uno de ellos (LLA)—, también tendrán iguales los lados y el ángulo restantes.",
  enunciado: "Sean [[A]][[B]][[C]] y [[D]][[E]][[F]] dos triángulos con el ángulo ABC igual al ángulo DEF, el ángulo ACB igual al ángulo DFE, y BC igual a EF. Digo que los triángulos son congruentes en todo.",
  figuraInicial: { A:{x:-150,y:-100}, B:{x:-150,y:120}, C:{x:130,y:50}, D:{x:424.22,y:-231.57}, E:{x:300,y:-50}, F:{x:570.62,y:50.33} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"D",a:"E"},{de:"D",a:"F"},{de:"E",a:"F"} ],
  superposicion: { origen:["B","A","C"], destino:["E","D","F"] },
  demostracion: [
    { texto:"Supongamos, para llegar a una contradicción, que {{AB no fuera igual a DE}}; entonces uno de los dos sería mayor. Sea AB el mayor, y márquese sobre él un punto G tal que GB sea igual a DE.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"D",a:"E"}] ] },
    { texto:"Como {{GB es igual a DE}} y {{BC es igual a EF}}, con el mismo ángulo en B que en E, por LAL [I,4] {{el triángulo GBC es congruente con el triángulo DEF}}; en particular, el ángulo GCB sería igual al ángulo DFE.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"E",a:"F"}] ] },
    { texto:"Pero por hipótesis {{el ángulo ACB ya es igual al ángulo DFE}}; entonces el ángulo GCB sería igual al ángulo ACB — la parte igual al todo, lo cual es absurdo.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}] ] },
    { texto:"Luego {{AB no puede ser distinto de DE}}: son iguales. Por LAL [I,4], {{el triángulo ABC es entonces congruente con el triángulo DEF}} en todo. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"D",a:"E"}], [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","E","F"]}] ], accion:"superponer_completo" }
  ]
},

27: {
  tipo: "demostracion",
  numeroRomano: "XXVII",
  titulo: "Si una recta, al incidir sobre otras dos, forma ángulos alternos iguales entre sí, las dos rectas son paralelas.",
  enunciado: "Sea [[E]][[F]] una recta que corta a [[A]][[B]] en F y a [[C]][[D]] en E, formando el ángulo AFE igual al ángulo DEF (alternos). Digo que AB es paralela a CD.",
  figuraInicial: { A:{x:-200,y:-50}, B:{x:200,y:-50}, C:{x:-200,y:130}, D:{x:200,y:130}, E:{x:-100,y:130}, F:{x:100,y:-50} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"C",a:"D"},{de:"E",a:"F"} ],
  demostracion: [
    { texto:"Supongamos, para llegar a una contradicción, que {{AB no fuera paralela a CD}}: entonces, prolongadas, se encontrarían en algún punto, digamos G.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"C",a:"D"}] ] },
    { texto:"En el triángulo GEF (formado por ese encuentro), {{el ángulo externo AFE}} sería mayor que {{el ángulo interno y opuesto GEF (=DEF)}} [I,16].",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"F",r1:"A",r2:"E"}], [{tipo:"angulo",vertice:"E",r1:"D",r2:"F"}] ] },
    { texto:"Pero por hipótesis {{el ángulo AFE es igual al ángulo DEF}}, no mayor. Contradicción.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"F",r1:"A",r2:"E"},{tipo:"angulo",vertice:"E",r1:"D",r2:"F"}] ] },
    { texto:"Por consiguiente, AB y CD no pueden encontrarse: {{son paralelas}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"C",a:"D"}] ] }
  ]
},

28: {
  tipo: "demostracion",
  numeroRomano: "XXVIII",
  titulo: "Si una recta, al incidir sobre dos rectas, forma el ángulo externo igual al interno y opuesto del mismo lado, o los ángulos internos del mismo lado suman dos rectos, las dos rectas son paralelas.",
  enunciado: "Sea [[E]][[F]] una recta que corta a [[A]][[B]] en F y a [[C]][[D]] en E, formando el ángulo EFB y el ángulo FED (ambos internos, del mismo lado) cuya suma es igual a dos rectos. Digo que AB es paralela a CD.",
  figuraInicial: { A:{x:-200,y:-50}, B:{x:200,y:-50}, C:{x:-200,y:130}, D:{x:200,y:130}, E:{x:-100,y:130}, F:{x:100,y:-50} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"C",a:"D"},{de:"E",a:"F"} ],
  demostracion: [
    { texto:"Como AB es una recta cortada por EF, {{el ángulo AFE más el ángulo EFB}} es igual a dos rectos [I,13].",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"F",r1:"A",r2:"E"},{tipo:"angulo",vertice:"F",r1:"E",r2:"B"}] ] },
    { texto:"Pero por hipótesis {{el ángulo EFB más el ángulo FED}} ya es igual a dos rectos.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"F",r1:"E",r2:"B"},{tipo:"angulo",vertice:"E",r1:"F",r2:"D"}] ] },
    { texto:"Ambas sumas son iguales a dos rectos, así que son iguales entre sí. Quitando de las dos {{el ángulo EFB}}, que es común [N.C. 3], {{el ángulo AFE es igual al ángulo FED}} — son alternos.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"F",r1:"E",r2:"B"}], [{tipo:"angulo",vertice:"F",r1:"A",r2:"E"},{tipo:"angulo",vertice:"E",r1:"F",r2:"D"}] ] },
    { texto:"Por I.27 (ángulos alternos iguales implican paralelas), {{AB es paralela a CD}}. El mismo resultado se sigue si en cambio el ángulo externo fuera igual al interno y opuesto del mismo lado, combinando I.13 y I.15. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"C",a:"D"}] ] }
  ]
},

29: {
  tipo: "demostracion",
  numeroRomano: "XXIX",
  titulo: "La recta que incide sobre dos rectas paralelas hace los ángulos alternos iguales entre sí, el ángulo externo igual al interno y opuesto, y los ángulos internos del mismo lado iguales a dos rectos.",
  enunciado: "Sea [[E]][[F]] una recta que incide sobre las paralelas [[A]][[B]] y [[C]][[D]]. Digo que el ángulo AFE es igual al ángulo FED (alternos), que el ángulo externo (formado al prolongar EF más allá de F, del lado de B) es igual al ángulo FED, y que el ángulo EFB más el ángulo FED es igual a dos rectos (internos del mismo lado).",
  figuraInicial: { A:{x:-200,y:-50}, B:{x:200,y:-50}, C:{x:-200,y:130}, D:{x:200,y:130}, E:{x:-100,y:130}, F:{x:100,y:-50} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"C",a:"D"},{de:"E",a:"F"} ],
  demostracion: [
    { texto:"Supongamos, para llegar a una contradicción, que {{el ángulo AFE no fuera igual al ángulo FED}}: uno de los dos sería mayor; sea AFE el mayor.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"F",r1:"A",r2:"E"},{tipo:"angulo",vertice:"E",r1:"F",r2:"D"}] ] },
    { texto:"Añadiendo {{el ángulo BFE}} a ambos, {{el ángulo AFE más el ángulo BFE}} (que es igual a dos rectos, por I.13) sería mayor que {{el ángulo FED más el ángulo BFE}}.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"F",r1:"E",r2:"B"}], [{tipo:"angulo",vertice:"F",r1:"A",r2:"E"}] ] },
    { texto:"Entonces {{el ángulo BFE más el ángulo FED}} sería menor que dos rectos. Pero, por el Postulado 5, dos rectas que forman con una transversal ángulos internos de un lado que suman menos de dos rectos deben encontrarse de ese lado — contradiciendo que AB y CD son paralelas.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"F",r1:"E",r2:"B"}] ] },
    { texto:"Por consiguiente, {{el ángulo AFE es igual al ángulo FED}}. Y como {{el ángulo AFE más el ángulo EFB}} es igual a dos rectos [I,13], sustituyendo se obtiene que {{el ángulo EFB más el ángulo FED}} es también igual a dos rectos. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"F",r1:"A",r2:"E"},{tipo:"angulo",vertice:"E",r1:"F",r2:"D"}], [{tipo:"angulo",vertice:"F",r1:"A",r2:"E"},{tipo:"angulo",vertice:"F",r1:"E",r2:"B"}], [{tipo:"angulo",vertice:"F",r1:"E",r2:"B"},{tipo:"angulo",vertice:"E",r1:"F",r2:"D"}] ] }
  ]
},

30: {
  tipo: "demostracion",
  numeroRomano: "XXX",
  titulo: "Las rectas paralelas a una misma recta son también paralelas entre sí.",
  enunciado: "Sean [[A]][[B]] y [[E]][[F]] dos rectas, ambas paralelas a una tercera recta [[C]][[D]]. Digo que AB es paralela a EF.",
  figuraInicial: { A:{x:-200,y:-50}, B:{x:200,y:-50}, C:{x:-200,y:130}, D:{x:200,y:130}, E:{x:-200,y:300}, F:{x:200,y:300}, G:{x:120,y:300}, H:{x:3.43,y:130}, K:{x:-120,y:-50} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"C",a:"D"},{de:"E",a:"F"},{de:"G",a:"K"} ],
  demostracion: [
    { texto:"Trácese una transversal {{GK}} que corte a las tres rectas, pasando por G en EF, H en CD, y K en AB. Como EF es paralela a CD, {{el ángulo HGE es igual al ángulo GHD}} [I,29] (alternos internos).",
      resaltaPorClausula:[ [{tipo:"segmento",de:"G",a:"K"}], [{tipo:"angulo",vertice:"G",r1:"H",r2:"E"},{tipo:"angulo",vertice:"H",r1:"G",r2:"D"}] ] },
    { texto:"Y como AB es paralela a CD, {{el ángulo GHD es igual al ángulo HKB}} [I,29] (alternos internos).",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"H",r1:"G",r2:"D"},{tipo:"angulo",vertice:"K",r1:"H",r2:"B"}] ] },
    { texto:"Por tanto, {{el ángulo HGE es igual al ángulo HKB}} (ambos iguales al ángulo intermedio GHD); estos son ángulos correspondientes para la transversal GK respecto de EF y AB.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"G",r1:"H",r2:"E"},{tipo:"angulo",vertice:"K",r1:"H",r2:"B"}] ] },
    { texto:"Por I.28 (ángulos correspondientes iguales), {{AB es paralela a EF}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"E",a:"F"}] ] }
  ]
},

31: {
  tipo: "construccion",
  numeroRomano: "XXXI",
  titulo: "Trazar, por un punto dado, una recta paralela a una recta dada.",
  enunciado: "Sea [[A]] el punto dado y [[B]][[C]] la recta dada. Hay que trazar por A una recta paralela a BC.",
  puntosDados: { A:{x:-50,y:-150}, B:{x:-200,y:100}, C:{x:150,y:100}, D:{x:-50,y:100} },
  segmentosDados: [ {id:"BC", de:"B", a:"C"} ],
  notaPuntoDado: "D se toma «al azar» sobre BC, de modo que quede determinado el segmento AD.",
  pasos: [
    { tipo:"segmento", herramienta:"segmento", id:"AD", de:"A", a:"D",
      instruccion:"Traza el segmento AD." },
    { tipo:"recta", herramienta:"recta", id:"DAext", de:"D", a:"A", extender:true,
      instruccion:"Prolonga la recta DA más allá de A." },
    { tipo:"circulo", herramienta:"circulo", id:"c1", centro:"A", radioEntre:["D","A"],
      instruccion:"Traza una circunferencia con centro en A y radio igual a DA (haz clic en D)." },
    { tipo:"interseccion", herramienta:"punto", id:"F", obj1:"c1", obj2:"DAext", cual:"masAlla:D,A",
      instruccion:"Marca el punto F donde esa circunferencia corta la prolongación: AF queda igual a DA." },
    { tipo:"circulo", herramienta:"circulo", id:"c2", centro:"A", radioEntre:["D","C"],
      instruccion:"Traza una circunferencia con centro en A y radio igual a DC (haz clic en D o en C)." },
    { tipo:"circulo", herramienta:"circulo", id:"c3", centro:"F", radioEntre:["A","C"],
      instruccion:"Traza una circunferencia con centro en F y radio igual a AC (haz clic en A o en C)." },
    { tipo:"interseccion", herramienta:"punto", id:"G", obj1:"c2", obj2:"c3", cual:"izquierda",
      instruccion:"Marca el punto G donde se cortan: el ángulo FAG queda igual al ángulo ADC." },
    { tipo:"recta", herramienta:"recta", id:"AG", de:"A", a:"G",
      instruccion:"Traza la recta AG: es la paralela buscada." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__PARALELA_CONSTRUIDA__"] }
  ],
  demostracion: [
    { texto:"Por construcción, {{el ángulo FAG es igual al ángulo ADC}} (criterio LLL [I,8], como en I.23).",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"F",r2:"G"},{tipo:"angulo",vertice:"D",r1:"A",r2:"C"}] ] },
    { texto:"Estos son ángulos alternos para la transversal {{AD}} respecto de las rectas {{AG}} y {{BC}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"D"}], [{tipo:"segmento",de:"A",a:"G"},{tipo:"segmento",de:"B",a:"C"}] ] },
    { texto:"Por I.27 (ángulos alternos iguales implican paralelas), {{AG es paralela a BC}}. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"G"},{tipo:"segmento",de:"B",a:"C"}] ] }
  ]
},

32: {
  tipo: "demostracion",
  numeroRomano: "XXXII",
  titulo: "En todo triángulo, si se prolonga uno de los lados, el ángulo externo es igual a los dos ángulos internos y opuestos juntos; y los tres ángulos internos del triángulo son iguales a dos rectos.",
  enunciado: "Sea [[A]][[B]][[C]] un triángulo, y prolónguese BC hasta D. Digo que el ángulo ACD es igual a la suma de los ángulos BAC y ABC, y que los tres ángulos internos ABC, BAC y ACB son iguales a dos rectos.",
  figuraInicial: { A:{x:-30,y:-150}, B:{x:-160,y:100}, C:{x:120,y:130}, D:{x:269.15,y:145.98}, E:{x:189.20,y:-3.08} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"D"},{de:"C",a:"E"} ],
  demostracion: [
    { texto:"Por C, trácese {{CE paralela a AB}} [I,31].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"C",a:"E"},{tipo:"segmento",de:"A",a:"B"}] ] },
    { texto:"Como {{AB es paralela a CE}}, con la transversal AC, {{el ángulo BAC es igual al ángulo ACE}} (alternos) [I,29].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"C",a:"E"}], [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"},{tipo:"angulo",vertice:"C",r1:"A",r2:"E"}] ] },
    { texto:"Y con la transversal BD, {{el ángulo ABC es igual al ángulo ECD}} (correspondientes) [I,29].",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"},{tipo:"angulo",vertice:"C",r1:"E",r2:"D"}] ] },
    { texto:"Sumando, {{el ángulo ACE más el ángulo ECD}} (que juntos forman el ángulo externo ACD) es igual a {{el ángulo BAC más el ángulo ABC}}.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"C",r1:"A",r2:"D"}], [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"},{tipo:"angulo",vertice:"B",r1:"A",r2:"C"}] ] },
    { texto:"Añadiendo {{el ángulo ACB}} a ambos lados: {{el ángulo ACD más el ángulo ACB}} (que es igual a dos rectos, por I.13) es igual a {{los tres ángulos internos juntos}}. Por consiguiente, los tres ángulos internos del triángulo son iguales a dos rectos. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}], [{tipo:"angulo",vertice:"C",r1:"A",r2:"D"},{tipo:"angulo",vertice:"C",r1:"A",r2:"B"}], [{tipo:"triangulo",puntos:["A","B","C"]}] ] }
  ]
},

33: {
  tipo: "demostracion",
  numeroRomano: "XXXIII",
  titulo: "Las rectas que unen, por el mismo lado, los extremos de dos rectas iguales y paralelas, son también iguales y paralelas.",
  enunciado: "Sean [[A]][[B]] y [[C]][[D]] dos rectas iguales y paralelas, unidas por el mismo lado mediante AC y BD. Digo que AC es igual a BD, y que AC es paralela a BD.",
  figuraInicial: { A:{x:-150,y:-50}, B:{x:50,y:-90}, C:{x:-120,y:100}, D:{x:80,y:60} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"C",a:"D"},{de:"A",a:"C"},{de:"B",a:"D"},{de:"B",a:"C"} ],
  demostracion: [
    { texto:"Trácese {{BC}}. Como {{AB es paralela a CD}}, con la transversal BC, {{el ángulo ABC es igual al ángulo BCD}} (alternos) [I,29].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"C"}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"C"},{tipo:"angulo",vertice:"C",r1:"B",r2:"D"}] ] },
    { texto:"Y como {{AB es igual a CD}}, con {{BC}} como lado común y el ángulo comprendido igual, por LAL [I,4] {{el triángulo ABC es congruente con el triángulo DCB}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"C",a:"D"}], [{tipo:"segmento",de:"B",a:"C"}], [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","C","B"]}] ] },
    { texto:"Por tanto {{AC es igual a BD}}, y además {{el ángulo ACB es igual al ángulo DBC}} (alternos para la transversal BC).",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"C"},{tipo:"segmento",de:"B",a:"D"}], [{tipo:"angulo",vertice:"C",r1:"A",r2:"B"},{tipo:"angulo",vertice:"B",r1:"D",r2:"C"}] ] },
    { texto:"Por I.27 (ángulos alternos iguales implican paralelas), {{AC es paralela a BD}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"C"},{tipo:"segmento",de:"B",a:"D"}] ] }
  ]
},

34: {
  tipo: "demostracion",
  numeroRomano: "XXXIV",
  titulo: "En los paralelogramos, los lados y ángulos opuestos son iguales entre sí, y la diagonal los biseca en dos triángulos congruentes.",
  enunciado: "Sea [[A]][[B]][[C]][[D]] un paralelogramo (AB paralela a DC, AD paralela a BC), y trácese la diagonal [[B]][[D]]. Digo que AB es igual a DC, AD es igual a BC, el ángulo DAB es igual al ángulo BCD, y el triángulo ABD es congruente con el triángulo CDB.",
  figuraInicial: { A:{x:-150,y:-80}, B:{x:120,y:-130}, C:{x:170,y:70}, D:{x:-100,y:120} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"B",a:"C"},{de:"C",a:"D"},{de:"D",a:"A"},{de:"B",a:"D"} ],
  demostracion: [
    { texto:"Como {{AB es paralela a DC}}, con la transversal BD, {{el ángulo ABD es igual al ángulo BDC}} (alternos) [I,29].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"D",a:"C"}], [{tipo:"angulo",vertice:"B",r1:"A",r2:"D"},{tipo:"angulo",vertice:"D",r1:"B",r2:"C"}] ] },
    { texto:"Y como {{AD es paralela a BC}}, con la misma transversal, {{el ángulo ADB es igual al ángulo DBC}} (alternos) [I,29].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"B",a:"C"}], [{tipo:"angulo",vertice:"D",r1:"A",r2:"B"},{tipo:"angulo",vertice:"B",r1:"D",r2:"C"}] ] },
    { texto:"Con dos ángulos respectivamente iguales y {{el lado común BD}}, por ALA [I,26] {{el triángulo ABD es congruente con el triángulo CDB}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"D"}], [{tipo:"triangulo",puntos:["A","B","D"]},{tipo:"triangulo",puntos:["C","D","B"]}] ] },
    { texto:"Por tanto {{AB es igual a DC}}, {{AD es igual a BC}}, y {{el ángulo DAB (suma de los alternos) es igual al ángulo BCD}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"D",a:"C"}], [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"B",a:"C"}], [{tipo:"angulo",vertice:"A",r1:"D",r2:"B"},{tipo:"angulo",vertice:"C",r1:"B",r2:"D"}] ] }
  ]
},

35: {
  tipo: "demostracion",
  numeroRomano: "XXXV",
  titulo: "Los paralelogramos que están sobre la misma base y entre las mismas paralelas son iguales entre sí (en área).",
  enunciado: "Sean [[A]][[B]][[C]][[D]] y [[E]][[B]][[C]][[F]] dos paralelogramos sobre la misma base [[B]][[C]], situados entre las mismas dos rectas paralelas (la que contiene a BC, y la que contiene a A, D, E y F). Digo que el paralelogramo ABCD es igual al paralelogramo EBCF — no necesariamente congruente, sino igual en extensión.",
  figuraInicial: { A:{x:-100,y:-80}, B:{x:-150,y:100}, C:{x:50,y:100}, D:{x:100,y:-80}, E:{x:-200,y:-80}, F:{x:0,y:-80} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"B",a:"C"},{de:"C",a:"D"},{de:"D",a:"A"},{de:"E",a:"B"},{de:"C",a:"F"},{de:"E",a:"F"} ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"Por I.34, {{AD es igual a BC}} (lados opuestos del paralelogramo ABCD), y {{EF es igual a BC}} (lados opuestos de EBCF); luego {{AD es igual a EF}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"B",a:"C"}], [{tipo:"segmento",de:"E",a:"F"},{tipo:"segmento",de:"B",a:"C"}], [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"E",a:"F"}] ] },
    { texto:"Como A, D, E y F están sobre la misma paralela a BC, y {{AD es igual a EF}}, el triángulo ABE (o su análogo, según la posición relativa) resulta congruente con el triángulo DCF por LAL [I,4] o por superposición de partes comunes.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"E",a:"F"}] ] },
    { texto:"Quitando de la figura entera EBCD las partes comunes y comparando lo que sobra en cada paralelogramo, {{el paralelogramo ABCD}} y {{el paralelogramo EBCF}} resultan estar compuestos por las mismas piezas — un triángulo y un cuadrilátero comunes, más dos triángulos congruentes intercambiados.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","D"]}], [{tipo:"triangulo",puntos:["E","B","F"]}] ] },
    { texto:"Por consiguiente, {{el paralelogramo ABCD es igual en área al paralelogramo EBCF}} — aunque no son congruentes (no se superponen exactamente), abarcan la misma extensión. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","D"]},{tipo:"triangulo",puntos:["D","C","A"]}] ] }
  ]
},

36: {
  tipo: "demostracion",
  numeroRomano: "XXXVI",
  titulo: "Los paralelogramos que están sobre bases iguales y entre las mismas paralelas son iguales entre sí (en área).",
  enunciado: "Sean [[A]][[B]][[C]][[D]] y [[E]][[F]][[G]][[H]] dos paralelogramos con bases BC y FG iguales, situados entre las mismas paralelas. Digo que el paralelogramo ABCD es igual al paralelogramo EFGH.",
  figuraInicial: { A:{x:-150,y:-80}, B:{x:-200,y:100}, C:{x:0,y:100}, D:{x:50,y:-80}, E:{x:150,y:-80}, F:{x:80,y:100}, G:{x:280,y:100}, H:{x:350,y:-80} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"B",a:"C"},{de:"C",a:"D"},{de:"D",a:"A"},{de:"E",a:"F"},{de:"F",a:"G"},{de:"G",a:"H"},{de:"H",a:"E"},{de:"B",a:"F"},{de:"C",a:"G"} ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"Trácense {{BF}} y {{CG}}. Como BC es igual a FG, y ambas son rectas, {{BC es igual a FG}} y ambas están sobre la misma recta paralela inferior.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"F"}], [{tipo:"segmento",de:"C",a:"G"}], [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"F",a:"G"}] ] },
    { texto:"Entonces {{BF es igual y paralela a CG}} (por I.33, ya que BC es igual y paralela a FG misma recta); luego {{BFGC es un paralelogramo}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"F"},{tipo:"segmento",de:"C",a:"G"}] ] },
    { texto:"Por I.35, {{el paralelogramo ABCD es igual al paralelogramo BFGC}} (misma base BC, entre las mismas paralelas); y también {{el paralelogramo EFGH es igual al paralelogramo BFGC}} (misma base FG).",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"C"}], [{tipo:"segmento",de:"F",a:"G"}] ] },
    { texto:"Como ambos son iguales a la misma figura intermedia, {{el paralelogramo ABCD es igual al paralelogramo EFGH}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["E","F","G"]}] ] }
  ]
},

37: {
  tipo: "demostracion",
  numeroRomano: "XXXVII",
  titulo: "Los triángulos que están sobre la misma base y entre las mismas paralelas son iguales entre sí (en área).",
  enunciado: "Sean [[A]][[B]][[C]] y [[D]][[B]][[C]] dos triángulos sobre la misma base [[B]][[C]], con A y D en la misma paralela a BC. Digo que el triángulo ABC es igual al triángulo DBC.",
  figuraInicial: { A:{x:-80,y:-100}, B:{x:-150,y:100}, C:{x:100,y:100}, D:{x:50,y:-100} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"D",a:"B"},{de:"D",a:"C"} ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"Por A, trácese {{AE paralela a BC}} [I,31] (extendiendo en ambas direcciones), y por D, trácese también una paralela a BC: como A y D ya están en la misma paralela, es la misma recta.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"B",a:"C"}] ] },
    { texto:"Constrúyase {{el paralelogramo EBCA}} (con un lado EA sobre esa paralela) y {{el paralelogramo FBCD}} (análogo, usando D).",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]}], [{tipo:"triangulo",puntos:["D","B","C"]}] ] },
    { texto:"Por I.35, ambos paralelogramos (con la misma base BC, entre las mismas paralelas) son iguales entre sí; y por I.34, {{cada triángulo es la mitad de su paralelogramo}} (la diagonal lo biseca).",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","B","C"]}] ] },
    { texto:"Como las mitades de cantidades iguales son iguales, {{el triángulo ABC es igual al triángulo DBC}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","B","C"]}] ] }
  ]
},

38: {
  tipo: "demostracion",
  numeroRomano: "XXXVIII",
  titulo: "Los triángulos que están sobre bases iguales y entre las mismas paralelas son iguales entre sí (en área).",
  enunciado: "Sean [[A]][[B]][[C]] y [[D]][[G]][[H]] dos triángulos con bases BC y GH iguales, entre las mismas paralelas. Digo que el triángulo ABC es igual al triángulo DGH.",
  figuraInicial: { A:{x:-100,y:-80}, B:{x:-200,y:100}, C:{x:0,y:100}, D:{x:200,y:-80}, G:{x:80,y:100}, H:{x:280,y:100} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"D",a:"G"},{de:"D",a:"H"},{de:"G",a:"H"} ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"Constrúyanse los paralelogramos {{EBCA}} y {{FGHD}}, cada uno con base igual a la del triángulo correspondiente y entre las mismas paralelas.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]}], [{tipo:"triangulo",puntos:["D","G","H"]}] ] },
    { texto:"Por I.36, como {{BC es igual a GH}}, {{los dos paralelogramos son iguales entre sí}} (bases iguales, mismas paralelas).",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"C"},{tipo:"segmento",de:"G",a:"H"}], [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","G","H"]}] ] },
    { texto:"Por I.34, cada triángulo es la mitad de su paralelogramo. Como las mitades de cosas iguales son iguales, {{el triángulo ABC es igual al triángulo DGH}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","G","H"]}] ] }
  ]
},

39: {
  tipo: "demostracion",
  numeroRomano: "XXXIX",
  titulo: "Los triángulos iguales que están sobre la misma base y por el mismo lado, están entre las mismas paralelas.",
  enunciado: "Sean [[A]][[B]][[C]] y [[D]][[B]][[C]] dos triángulos iguales en área, sobre la misma base BC y por el mismo lado. Digo que A y D están en la misma paralela a BC.",
  figuraInicial: { A:{x:-80,y:-100}, B:{x:-150,y:100}, C:{x:100,y:100}, D:{x:50,y:-100} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"D",a:"B"},{de:"D",a:"C"},{de:"A",a:"D"} ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"Supongamos, para llegar a una contradicción, que {{AD no fuera paralela a BC}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"B",a:"C"}] ] },
    { texto:"Entonces, por A, la paralela a BC [I,31] cortaría a la recta BD (prolongada si es necesario) en un punto distinto de D, digamos E.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]}] ] },
    { texto:"Por I.37, {{el triángulo ABC sería igual al triángulo EBC}} (misma base, entre las mismas paralelas). Pero por hipótesis {{el triángulo ABC ya es igual al triángulo DBC}}; entonces el triángulo EBC sería igual al triángulo DBC — imposible, salvo que E coincida con D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]}], [{tipo:"triangulo",puntos:["D","B","C"]}] ] },
    { texto:"Por consiguiente, {{A y D están en la misma paralela a BC}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"B",a:"C"}] ] }
  ]
},

40: {
  tipo: "demostracion",
  numeroRomano: "XL",
  titulo: "Los triángulos iguales que están sobre bases iguales y por el mismo lado, están entre las mismas paralelas.",
  enunciado: "Sean [[A]][[B]][[C]] y [[D]][[G]][[H]] dos triángulos iguales en área, con bases BC y GH iguales, por el mismo lado. Digo que A y D están en la misma paralela a BC y GH.",
  figuraInicial: { A:{x:-100,y:-80}, B:{x:-200,y:100}, C:{x:0,y:100}, D:{x:200,y:-80}, G:{x:80,y:100}, H:{x:280,y:100} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"D",a:"G"},{de:"D",a:"H"},{de:"G",a:"H"} ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"Supongamos, para llegar a una contradicción, que {{A y D no estuvieran en la misma paralela a BC y GH}}.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","G","H"]}] ] },
    { texto:"Por A, trácese la paralela a BC [I,31]; cortaría a la recta DH (o su prolongación) en un punto E distinto de D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]}] ] },
    { texto:"Por I.38, {{el triángulo ABC sería igual al triángulo EGH}} (bases iguales BC=GH, entre las mismas paralelas). Pero por hipótesis {{ABC ya es igual a DGH}} — entonces EGH sería igual a DGH, imposible salvo que E coincida con D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]}], [{tipo:"triangulo",puntos:["D","G","H"]}] ] },
    { texto:"Por consiguiente, {{A y D están entre las mismas paralelas}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["D","G","H"]}] ] }
  ]
},

41: {
  tipo: "demostracion",
  numeroRomano: "XLI",
  titulo: "Si un paralelogramo tiene la misma base que un triángulo y está entre las mismas paralelas, el paralelogramo es el doble del triángulo (en área).",
  enunciado: "Sea [[A]][[B]][[C]][[D]] un paralelogramo con la misma base BC que el triángulo [[D]][[B]][[C]] (vértice D), entre las mismas paralelas. Digo que el paralelogramo ABCD es el doble del triángulo DBC.",
  figuraInicial: { A:{x:-330,y:-100}, B:{x:-150,y:100}, C:{x:100,y:100}, D:{x:-80,y:-100} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"B",a:"C"},{de:"C",a:"D"},{de:"D",a:"A"} ],
  esDobleDeArea: true,
  demostracion: [
    { texto:"Trácese la diagonal {{BD}} del paralelogramo.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"D"}] ] },
    { texto:"Por I.34, {{la diagonal BD divide el paralelogramo ABCD en dos triángulos congruentes}}: el triángulo ABD y el triángulo CBD (=DBC).",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","D"]},{tipo:"triangulo",puntos:["C","B","D"]}] ] },
    { texto:"Como {{el paralelogramo entero ABCD}} se compone exactamente de {{esos dos triángulos congruentes}}, y uno de ellos es el triángulo DBC dado, {{el paralelogramo es el doble del triángulo DBC}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["A","C","D"]}], [{tipo:"triangulo",puntos:["A","B","D"]},{tipo:"triangulo",puntos:["C","B","D"]}], [{tipo:"triangulo",puntos:["D","B","C"]}] ] }
  ]
},

42: {
  tipo: "construccion",
  numeroRomano: "XLII",
  titulo: "Construir, en un ángulo rectilíneo dado, un paralelogramo igual a un triángulo dado.",
  enunciado: "Sea [[A]][[B]][[C]] el triángulo dado, y [[D]][[K]][[L]] el ángulo dado (con vértice D). Hay que construir un paralelogramo igual al triángulo ABC, que tenga un ángulo igual al ángulo D.",
  puntosDados: { A:{x:-50,y:-150}, B:{x:-180,y:80}, C:{x:120,y:100}, D:{x:300,y:0}, K:{x:420,y:0}, L:{x:330,y:-100}, N:{x:-3.24,y:206.98}, P:{x:49.78,y:-143.35}, Q:{x:142.30,y:197.48} },
  segmentosDados: [ {id:"AB", de:"A", a:"B"}, {id:"AC", de:"A", a:"C"}, {id:"BC", de:"B", a:"C"}, {id:"DK", de:"D", a:"K"}, {id:"DL", de:"D", a:"L"} ],
  notaPuntoDado: "N marca la dirección del ángulo D ya copiado en E (método de I.23); P marca la dirección de la paralela a BC por A (método de I.31); Q marca la dirección de la paralela a EN por C. Los tres se dan fijos para no repetir esas construcciones ya vistas.",
  pasos: [
    { tipo:"puntoEnSegmento", herramienta:"punto", id:"E", de:"B", a:"C", fraccion:0.5,
      instruccion:"Biseca BC (como en I.10): E es su punto medio." },
    { tipo:"segmento", herramienta:"segmento", id:"AE", de:"A", a:"E",
      instruccion:"Traza el segmento AE." },
    { tipo:"recta", herramienta:"recta", id:"EN", de:"E", a:"N", extender:true,
      instruccion:"Traza la recta EN (el ángulo CEN ya es igual al ángulo D, copiado como en I.23)." },
    { tipo:"recta", herramienta:"recta", id:"AP", de:"A", a:"P", extender:true,
      instruccion:"Traza la recta AP, paralela a BC (como en I.31)." },
    { tipo:"interseccion", herramienta:"punto", id:"F", obj1:"EN", obj2:"AP", cual:"izquierda",
      instruccion:"Marca el punto F donde se cortan: FECA es un trapecio, falta cerrarlo." },
    { tipo:"recta", herramienta:"recta", id:"CQ", de:"C", a:"Q", extender:true,
      instruccion:"Traza la recta CQ, paralela a EN (como en I.31)." },
    { tipo:"interseccion", herramienta:"punto", id:"G", obj1:"CQ", obj2:"AP", cual:"derecha",
      instruccion:"Marca el punto G donde se cortan: FECG es el paralelogramo buscado." },
    { tipo:"segmento", herramienta:"segmento", id:"FE", de:"F", a:"E",
      instruccion:"Traza el segmento FE." },
    { tipo:"segmento", herramienta:"segmento", id:"CG", de:"C", a:"G",
      instruccion:"Traza el segmento CG." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__PARALELOGRAMO_IGUAL_TRIANGULO__"] }
  ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"Por construcción, {{el ángulo CEN (=FEC) es igual al ángulo D}}, y {{FECG es un paralelogramo}} (AP paralela a BC, CQ paralela a EN).",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"E",r1:"F",r2:"C"}], [{tipo:"triangulo",puntos:["F","E","C"]}] ] },
    { texto:"Como {{BE es igual a EC}} (E es el punto medio), {{el triángulo ABE es igual al triángulo AEC}} [I,38], cada uno mitad del triángulo ABC.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"E"},{tipo:"segmento",de:"E",a:"C"}], [{tipo:"triangulo",puntos:["A","B","E"]},{tipo:"triangulo",puntos:["A","E","C"]}] ] },
    { texto:"Por I.41, {{el paralelogramo FECG (misma base EC que el triángulo AEC, entre las mismas paralelas) es el doble del triángulo AEC}} — es decir, igual al triángulo ABC completo.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["F","E","C"]},{tipo:"triangulo",puntos:["A","E","C"]}] ] },
    { texto:"Por consiguiente, {{el paralelogramo FECG es igual al triángulo ABC}}, y tiene un ángulo (en E) igual al ángulo D dado. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["F","E","C"]},{tipo:"triangulo",puntos:["A","B","C"]}] ] }
  ]
},

43: {
  tipo: "demostracion",
  numeroRomano: "XLIII",
  titulo: "En todo paralelogramo, los complementos de los paralelogramos construidos en torno a la diagonal son iguales entre sí (en área).",
  enunciado: "Sea [[A]][[B]][[C]][[D]] un paralelogramo con diagonal AC, y sea [[K]] un punto de esa diagonal. Por K se trazan paralelas a los lados, formando los paralelogramos AEKF y KGCH (en torno a la diagonal) y los complementos EBHK y FKGD. Digo que los dos complementos son iguales entre sí.",
  figuraInicial: { A:{x:-150,y:-80}, B:{x:-200,y:100}, C:{x:50,y:100}, D:{x:100,y:-80}, K:{x:-70,y:-8}, E:{x:-170,y:-8}, F:{x:-50,y:-80}, H:{x:-100,y:100}, G:{x:80,y:-8} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"B",a:"C"},{de:"C",a:"D"},{de:"D",a:"A"},{de:"A",a:"C"},{de:"E",a:"H"},{de:"F",a:"G"} ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"Por I.34, como AEKF es un paralelogramo con diagonal AK, {{el triángulo AEK es igual al triángulo AFK}}. Por la misma razón, en KGCH, {{el triángulo KGC es igual al triángulo KHC}}.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","E","K"]},{tipo:"triangulo",puntos:["A","F","K"]}], [{tipo:"triangulo",puntos:["K","G","C"]},{tipo:"triangulo",puntos:["K","H","C"]}] ] },
    { texto:"Y en el paralelogramo completo ABCD, con diagonal AC, {{el triángulo ABC es igual al triángulo ADC}} [I,34].",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","B","C"]},{tipo:"triangulo",puntos:["A","D","C"]}] ] },
    { texto:"El triángulo ABC se compone de {{el triángulo AEK}}, {{el complemento EBHK}} y {{el triángulo KHC}}; el triángulo ADC se compone de {{el triángulo AFK}}, {{el complemento FKGD}} y {{el triángulo KGC}}.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["A","E","K"]}], [{tipo:"poligono",puntos:["E","B","H","K"]}], [{tipo:"triangulo",puntos:["K","H","C"]}] ] },
    { texto:"Quitando de cada lado las partes ya demostradas iguales (los dos pares de triángulos), lo que resta también es igual: {{el complemento EBHK es igual al complemento FKGD}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["E","B","H","K"]},{tipo:"poligono",puntos:["F","K","G","D"]}] ] }
  ]
},

44: {
  tipo: "construccion",
  numeroRomano: "XLIV",
  titulo: "Aplicar, a una recta dada, en un ángulo dado, un paralelogramo igual a un triángulo dado.",
  enunciado: "Sea [[A]][[B]] la recta dada, [[D]][[K]][[L]] el ángulo dado, y [[C1]][[C2]][[C3]] el triángulo dado. Hay que construir sobre AB, con un ángulo igual a D, un paralelogramo igual al triángulo dado.",
  puntosDados: { A:{x:-200,y:50}, B:{x:50,y:50}, D:{x:600,y:0}, K:{x:700,y:0}, L:{x:630,y:-90}, C1:{x:300,y:-100}, C2:{x:420,y:-80}, C3:{x:340,y:50}, Lp:{x:-188.53,y:15.60}, M:{x:61.47,y:15.60} },
  segmentosDados: [ {id:"AB", de:"A", a:"B"}, {id:"DK", de:"D", a:"K"}, {id:"DL", de:"D", a:"L"}, {id:"C1C2", de:"C1", a:"C2"}, {id:"C2C3", de:"C2", a:"C3"}, {id:"C3C1", de:"C3", a:"C1"} ],
  notaPuntoDado: "Lp y M se dan fijos: marcan los dos vértices que faltan del paralelogramo, ya resueltos mediante la construcción intermedia de I.42 y la técnica de complementos de I.43 (deslizando el paralelogramo auxiliar hasta apoyarlo exactamente sobre AB).",
  pasos: [
    { tipo:"segmento", herramienta:"segmento", id:"ALp", de:"A", a:"Lp",
      instruccion:"Traza el segmento ALp (el lado del paralelogramo que forma el ángulo D con AB)." },
    { tipo:"segmento", herramienta:"segmento", id:"BM", de:"B", a:"M",
      instruccion:"Traza el segmento BM, paralelo a ALp." },
    { tipo:"segmento", herramienta:"segmento", id:"LpM", de:"Lp", a:"M",
      instruccion:"Traza el segmento LpM, cerrando el paralelogramo ABMLp." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__PARALELOGRAMO_APLICADO__"] }
  ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"El paralelogramo {{ABMLp}} tiene base AB (la recta dada) y {{el ángulo LpAB igual al ángulo D}} (construido mediante I.42 sobre un punto auxiliar, y luego desplazado con la técnica de los complementos iguales de I.43, hasta apoyarse exactamente en B).",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["A","B","M","Lp"]}], [{tipo:"angulo",vertice:"A",r1:"Lp",r2:"B"}] ] },
    { texto:"Por construcción (vía I.42), el paralelogramo auxiliar tenía área igual al triángulo {{C1C2C3}} dado.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["C1","C2","C3"]}] ] },
    { texto:"Por I.43, deslizar un paralelogramo a lo largo de la misma base, reemplazando con su complemento igual, no cambia su área; así, {{el paralelogramo ABMLp conserva esa misma área}}.",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["A","B","M","Lp"]}] ] },
    { texto:"Por consiguiente, {{el paralelogramo ABMLp es igual al triángulo dado}}, y está aplicado exactamente sobre la recta AB, con el ángulo D. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["A","B","M","Lp"]},{tipo:"triangulo",puntos:["C1","C2","C3"]}] ] }
  ]
},

45: {
  tipo: "construccion",
  numeroRomano: "XLV",
  titulo: "Construir, en un ángulo rectilíneo dado, un paralelogramo igual a una figura rectilínea dada.",
  enunciado: "Sea [[P]][[Q]][[R]][[S]] la figura rectilínea dada (un cuadrilátero), y [[D]][[K]][[L]] el ángulo dado. Hay que construir un paralelogramo igual a PQRS, con un ángulo igual a D.",
  puntosDados: { P:{x:-250,y:-180}, Q:{x:-100,y:-220}, R:{x:-50,y:-50}, S:{x:-200,y:0}, D:{x:600,y:0}, K:{x:700,y:0}, L:{x:630,y:-90}, A:{x:50,y:100}, B:{x:280,y:100}, Lp:{x:91.30,y:-23.91}, M:{x:321.30,y:-23.91} },
  segmentosDados: [ {id:"PQ", de:"P", a:"Q"}, {id:"QR", de:"Q", a:"R"}, {id:"RS", de:"R", a:"S"}, {id:"SP", de:"S", a:"P"}, {id:"DK", de:"D", a:"K"}, {id:"DL", de:"D", a:"L"}, {id:"AB", de:"A", a:"B"} ],
  notaPuntoDado: "Lp y M se dan fijos: el método consiste en descomponer PQRS en los triángulos PQR y PRS (trazando la diagonal PR), aplicar cada uno por separado sobre la misma base AB mediante I.44, y unir los resultados en un solo paralelogramo — aquí se da el resultado final ya combinado.",
  pasos: [
    { tipo:"segmento", herramienta:"segmento", id:"PR", de:"P", a:"R",
      instruccion:"Traza la diagonal PR, dividiendo PQRS en dos triángulos: PQR y PRS." },
    { tipo:"segmento", herramienta:"segmento", id:"ALp", de:"A", a:"Lp",
      instruccion:"Traza el segmento ALp (el lado que forma el ángulo D con AB)." },
    { tipo:"segmento", herramienta:"segmento", id:"BM", de:"B", a:"M",
      instruccion:"Traza el segmento BM, paralelo a ALp." },
    { tipo:"segmento", herramienta:"segmento", id:"LpM", de:"Lp", a:"M",
      instruccion:"Traza el segmento LpM, cerrando el paralelogramo ABMLp." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__PARALELOGRAMO_POLIGONO__"] }
  ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"La diagonal PR divide la figura en {{el triángulo PQR}} y {{el triángulo PRS}}; juntos componen exactamente la figura completa PQRS.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["P","Q","R"]}], [{tipo:"triangulo",puntos:["P","R","S"]}] ] },
    { texto:"Por I.44, se aplica sobre AB, en el ángulo D, un paralelogramo igual al triángulo PQR; y a continuación, sobre el lado restante, otro paralelogramo igual al triángulo PRS, con el mismo ángulo — de modo que ambos se combinan en una sola figura.",
      resaltaPorClausula:[ [{tipo:"triangulo",puntos:["P","Q","R"]}], [{tipo:"triangulo",puntos:["P","R","S"]}] ] },
    { texto:"El resultado, {{el paralelogramo ABMLp}}, tiene área igual a la suma de ambos triángulos, es decir, {{igual a la figura PQRS completa}}, y conserva el ángulo D en A.",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["A","B","M","Lp"]}], [{tipo:"poligono",puntos:["P","Q","R","S"]}] ] },
    { texto:"Por consiguiente, {{el paralelogramo ABMLp es igual a la figura rectilínea dada}}, con el ángulo D. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["A","B","M","Lp"]},{tipo:"poligono",puntos:["P","Q","R","S"]}] ] }
  ]
},

46: {
  tipo: "construccion",
  numeroRomano: "XLVI",
  titulo: "Construir un cuadrado sobre una recta dada.",
  enunciado: "Sea [[A]][[B]] la recta dada. Hay que construir un cuadrado sobre AB.",
  puntosDados: { A:{x:-100,y:80}, B:{x:100,y:80}, C:{x:-100,y:280}, D:{x:100,y:280} },
  segmentosDados: [ {id:"AB", de:"A", a:"B"} ],
  notaPuntoDado: "C ya es el resultado de trazar la perpendicular a AB en A [I,11], con AC igual a AB. D ya es el resultado de trazar la paralela a AC por B, y la paralela a AB por C [I,31], cortándose en D.",
  pasos: [
    { tipo:"segmento", herramienta:"segmento", id:"AC", de:"A", a:"C",
      instruccion:"Traza el segmento AC (la perpendicular ya construida, con AC igual a AB)." },
    { tipo:"segmento", herramienta:"segmento", id:"CD", de:"C", a:"D",
      instruccion:"Traza el segmento CD (paralelo a AB)." },
    { tipo:"segmento", herramienta:"segmento", id:"BD", de:"B", a:"D",
      instruccion:"Traza el segmento BD (paralelo a AC), cerrando el cuadrado." },
    { tipo:"fin", instruccion:"Construcción terminada — sigue la demostración.",
      verificar:["__CUADRADO__"] }
  ],
  demostracion: [
    { texto:"Por construcción, {{AB y CD son paralelas}} y {{AC y BD son paralelas}}; luego {{ABDC es un paralelogramo}} [Def. 23].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"C",a:"D"}], [{tipo:"poligono",puntos:["A","B","D","C"]}] ] },
    { texto:"Como {{AB es igual a AC}} (por construcción de la perpendicular), y en un paralelogramo los lados opuestos son iguales [I,34], {{los cuatro lados AB, BD, DC y CA son todos iguales entre sí}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"},{tipo:"segmento",de:"A",a:"C"}], [{tipo:"poligono",puntos:["A","B","D","C"]}] ] },
    { texto:"Y como {{el ángulo en A es recto}} (por construcción), y en un paralelogramo los ángulos opuestos son iguales [I,34] y los adyacentes suman dos rectos [I,13], {{los cuatro ángulos son todos rectos}}.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"}], [{tipo:"poligono",puntos:["A","B","D","C"]}] ] },
    { texto:"Por consiguiente, {{ABDC es un cuadrado}}, construido sobre la recta dada AB. Q.E.F.",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["A","B","D","C"]}] ] }
  ]
},

47: {
  tipo: "demostracion",
  numeroRomano: "XLVII",
  titulo: "En los triángulos rectángulos, el cuadrado del lado opuesto al ángulo recto es igual a la suma de los cuadrados de los otros dos lados.",
  enunciado: "Sea [[A]][[B]][[C]] un triángulo con el ángulo en A recto. Sobre cada lado se construye un cuadrado: BCED sobre la hipotenusa BC, ABFG sobre AB, y ACKH sobre AC. Digo que el cuadrado BCED es igual a la suma de los cuadrados ABFG y ACKH.",
  figuraInicial: {
    A:{x:0,y:0}, B:{x:160,y:0}, C:{x:0,y:120},
    D:{x:280,y:160}, E:{x:120,y:280},
    F:{x:160,y:-160}, G:{x:0,y:-160},
    H:{x:-120,y:120}, K:{x:-120,y:0},
    L:{x:177.6,y:236.8}, P:{x:57.6,y:76.8}
  },
  segmentosInicial: [
    {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},
    {de:"B",a:"D"},{de:"D",a:"E"},{de:"E",a:"C"},
    {de:"A",a:"G"},{de:"G",a:"F"},{de:"F",a:"B"},
    {de:"A",a:"K"},{de:"K",a:"H"},{de:"H",a:"C"},
    {de:"A",a:"L"},{de:"P",a:"L"}
  ],
  esIgualdadDeAreas: true,
  demostracion: [
    { texto:"Trácese {{la perpendicular AP a BC}} [I,12], y prolónguese hasta {{L}}, sobre el lado DE del cuadrado de la hipotenusa.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"P"}], [{tipo:"segmento",de:"P",a:"L"}] ] },
    { texto:"Como {{el ángulo BAC es recto}} y {{el ángulo BAG también es recto}} (ángulo del cuadrado ABFG), {{CA y AG forman una sola línea recta}} [I,14].",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"}], [{tipo:"angulo",vertice:"A",r1:"B",r2:"G"}], [{tipo:"segmento",de:"C",a:"A"},{tipo:"segmento",de:"A",a:"G"}] ] },
    { texto:"Como {{BD es igual a BC}} (lados del cuadrado BCED) y {{FB es igual a AB}} (lados del cuadrado ABFG), con el ángulo DBA igual al ángulo CBF (ambos formados por un ángulo recto más el ángulo ABC), {{el triángulo ABD es congruente con el triángulo FBC}} [I,4].",
      resaltaPorClausula:[ [{tipo:"segmento",de:"B",a:"D"},{tipo:"segmento",de:"B",a:"C"}], [{tipo:"segmento",de:"F",a:"B"},{tipo:"segmento",de:"A",a:"B"}], [{tipo:"triangulo",puntos:["A","B","D"]},{tipo:"triangulo",puntos:["F","B","C"]}] ] },
    { texto:"Por I.41, {{el rectángulo BDLP es el doble del triángulo ABD}} (misma base BD, entre las mismas paralelas); y {{el cuadrado ABFG es el doble del triángulo FBC}} (misma base FB).",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["B","D","L","P"]}], [{tipo:"poligono",puntos:["A","B","F","G"]}] ] },
    { texto:"Como los triángulos ABD y FBC son congruentes (iguales), sus dobles también son iguales: {{el rectángulo BDLP es igual al cuadrado ABFG}}.",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["B","D","L","P"]},{tipo:"poligono",puntos:["A","B","F","G"]}] ] },
    { texto:"Por un argumento exactamente análogo (con AH, KC y el triángulo ACE), {{el rectángulo CELP es igual al cuadrado ACKH}}.",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["C","E","L","P"]},{tipo:"poligono",puntos:["A","C","K","H"]}] ] },
    { texto:"Como {{el cuadrado BCED}} se compone exactamente de {{el rectángulo BDLP}} más {{el rectángulo CELP}}, y estos son iguales a los cuadrados ABFG y ACKH respectivamente, {{el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"poligono",puntos:["B","C","E","D"]}], [{tipo:"poligono",puntos:["A","B","F","G"]},{tipo:"poligono",puntos:["A","C","K","H"]}] ] }
  ]
},

48: {
  tipo: "demostracion",
  numeroRomano: "XLVIII",
  titulo: "Si en un triángulo el cuadrado de uno de los lados es igual a la suma de los cuadrados de los otros dos, el ángulo comprendido por esos otros dos lados es recto.",
  enunciado: "Sea [[A]][[B]][[C]] un triángulo tal que el cuadrado de BC es igual a la suma de los cuadrados de AB y AC. Digo que el ángulo BAC es recto.",
  figuraInicial: { A:{x:0,y:0}, B:{x:160,y:0}, C:{x:0,y:120}, D:{x:0,y:120} },
  segmentosInicial: [ {de:"A",a:"B"},{de:"A",a:"C"},{de:"B",a:"C"},{de:"A",a:"D"},{de:"B",a:"D"} ],
  demostracion: [
    { texto:"Tracemos desde A {{una perpendicular AD a AC}} [I,11] (un recurso auxiliar para la prueba), con {{AD igual a AC}} [I,3]; tracemos BD.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"D",r2:"C"}], [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"A",a:"C"}] ] },
    { texto:"Como {{el ángulo DAB es recto}}, por I.47 {{el cuadrado de BD es igual a la suma de los cuadrados de AB y AD}}.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"D",r2:"B"}], [{tipo:"triangulo",puntos:["A","B","D"]}] ] },
    { texto:"Pero {{AD es igual a AC}}, así que el cuadrado de BD es igual a la suma de los cuadrados de AB y AC — que por hipótesis es igual al cuadrado de BC. Luego {{BD es igual a BC}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"D"},{tipo:"segmento",de:"A",a:"C"}], [{tipo:"segmento",de:"B",a:"D"},{tipo:"segmento",de:"B",a:"C"}] ] },
    { texto:"Como {{AB es común}}, {{AD es igual a AC}}, y ahora {{BD es igual a BC}}, los triángulos ABD y ABC tienen sus tres lados respectivamente iguales; por LLL [I,8], {{el ángulo DAB es igual al ángulo CAB}}.",
      resaltaPorClausula:[ [{tipo:"segmento",de:"A",a:"B"}], [{tipo:"triangulo",puntos:["A","B","D"]},{tipo:"triangulo",puntos:["A","B","C"]}], [{tipo:"angulo",vertice:"A",r1:"D",r2:"B"},{tipo:"angulo",vertice:"A",r1:"C",r2:"B"}] ] },
    { texto:"Como {{el ángulo DAB ya era recto}}, {{el ángulo CAB (=BAC) es también recto}}. Q.E.D.",
      resaltaPorClausula:[ [{tipo:"angulo",vertice:"A",r1:"D",r2:"B"}], [{tipo:"angulo",vertice:"A",r1:"B",r2:"C"}] ] }
  ]
}

};

// ============================================================
// © 2026 Daniel Steven Moran Pizarro. Todos los derechos reservados.
// Colección: Otros Simuladores (Historia de las Matemáticas)
// https://dmbourbaki.github.io/
// Queda prohibida la reproducción, distribución o modificación total
// o parcial de este código sin autorización previa y por escrito del
// autor. Contacto: dmbourbaki@gmail.com
// ============================================================

// ============================================================
// GLOSARIO — Definiciones, Postulados, Nociones Comunes y Proposiciones I.1-I.10
// Basado en la edición Gredos (trad. Vara Donado, 1991) del Libro I de los Elementos.
// Vive aparte de RECETAS para poder usarse como panel de consulta independiente
// y como fuente de las fichas en el diagrama de macroestructura lógica.
// ============================================================

const GLOSARIO = {

definiciones: [
  { codigo:"Def.1", titulo:"Punto", resumen:"Un punto es lo que no tiene partes." },
  { codigo:"Def.2", titulo:"Línea", resumen:"Una línea es una longitud sin anchura." },
  { codigo:"Def.4", titulo:"Recta", resumen:"Una línea recta es aquella que yace por igual respecto de los puntos que están en ella." },
  { codigo:"Def.10", titulo:"Ángulo recto", resumen:"Cuando una recta levantada sobre otra forma ángulos adyacentes iguales entre sí, cada uno de esos ángulos es recto." },
  { codigo:"Def.15", titulo:"Círculo", resumen:"Un círculo es una figura plana comprendida por una línea (la circunferencia) tal que todas las rectas trazadas desde un punto interior (el centro) hasta ella son iguales entre sí." },
  { codigo:"Def.20", titulo:"Triángulo equilátero / isósceles", resumen:"Equilátero: el que tiene los tres lados iguales. Isósceles: el que tiene solo dos lados iguales." },
  { codigo:"Def.23", titulo:"Rectas paralelas", resumen:"Son rectas paralelas las que, estando en el mismo plano y prolongadas indefinidamente en ambos sentidos, no se encuentran nunca." }
],

postulados: [
  { codigo:"Post.1", titulo:"Trazar una recta", resumen:"Se puede trazar una recta desde un punto cualquiera hasta otro punto cualquiera." },
  { codigo:"Post.2", titulo:"Prolongar una recta", resumen:"Toda recta finita se puede prolongar indefinidamente en línea recta." },
  { codigo:"Post.3", titulo:"Trazar un círculo", resumen:"Se puede describir un círculo con cualquier centro y cualquier distancia (radio)." },
  { codigo:"Post.4", titulo:"Ángulos rectos", resumen:"Todos los ángulos rectos son iguales entre sí." },
  { codigo:"Post.5", titulo:"Postulado de las paralelas", resumen:"Si una recta, al cortar a otras dos, forma ángulos internos de un mismo lado que suman menos de dos rectos, esas dos rectas prolongadas se encontrarán de ese lado." }
],

nocionesComunes: [
  { codigo:"N.C.1", titulo:"Transitividad de la igualdad", resumen:"Las cosas iguales a una misma cosa son también iguales entre sí." },
  { codigo:"N.C.2", titulo:"Suma de iguales", resumen:"Si se añaden cosas iguales a cosas iguales, los totales son iguales." },
  { codigo:"N.C.3", titulo:"Resta de iguales", resumen:"Si de cosas iguales se quitan cosas iguales, los restos son iguales." },
  { codigo:"N.C.4", titulo:"Coincidencia", resumen:"Las cosas que coinciden entre sí (al superponerse exactamente) son iguales entre sí." },
  { codigo:"N.C.5", titulo:"El todo y la parte", resumen:"El todo es mayor que la parte." }
],

proposiciones: [
  { codigo:"I.1", tipo:"construcción", titulo:"Triángulo equilátero sobre una recta dada",
    resumen:"Dado un segmento, se construye sobre él un triángulo con los tres lados iguales, usando solo dos circunferencias que se cortan." },
  { codigo:"I.2", tipo:"construcción", titulo:"Trasladar una longitud a un punto dado",
    resumen:"Dado un punto y un segmento en otro lugar, se traza desde ese punto un segmento de la misma longitud — el compás de Euclides no transporta distancias libremente, así que esta construcción demuestra que aun así es posible." },
  { codigo:"I.3", tipo:"construcción", titulo:"Cortar de un segmento mayor uno igual al menor",
    resumen:"Dados dos segmentos desiguales, se marca sobre el mayor un punto tal que el trozo cortado sea exactamente igual al menor." },
  { codigo:"I.4", tipo:"teorema (LAL)", titulo:"Congruencia por lado-ángulo-lado",
    resumen:"Si dos triángulos tienen dos lados respectivamente iguales y el ángulo que forman esos lados también igual, entonces los triángulos son idénticos en todo: mismo tercer lado y mismos ángulos restantes. Se demuestra imaginando que se superpone un triángulo sobre el otro." },
  { codigo:"I.5", tipo:"teorema", titulo:"Ángulos de la base de un triángulo isósceles",
    resumen:"En un triángulo con dos lados iguales, los ángulos opuestos a esos lados (los de la base) son iguales entre sí. Conocido históricamente como el «pons asinorum»." },
  { codigo:"I.6", tipo:"teorema (converso de I.5)", titulo:"Si los ángulos de la base son iguales, el triángulo es isósceles",
    resumen:"El recíproco de I.5: si dos ángulos de un triángulo son iguales, los lados opuestos a ellos también lo son. Se demuestra por reducción al absurdo." },
  { codigo:"I.7", tipo:"teorema (unicidad)", titulo:"Unicidad del triángulo sobre una base dada",
    resumen:"No pueden existir dos triángulos distintos con la misma base y los mismos lados, en el mismo lado de la base. Es un resultado de unicidad, sin construcción nueva." },
  { codigo:"I.8", tipo:"teorema (LLL)", titulo:"Congruencia por lado-lado-lado",
    resumen:"Si dos triángulos tienen los tres lados respectivamente iguales, entonces sus ángulos correspondientes también son iguales. Se apoya en la unicidad demostrada en I.7." },
  { codigo:"I.9", tipo:"construcción", titulo:"Bisecar un ángulo",
    resumen:"Dado un ángulo, se traza la recta que lo divide en dos partes exactamente iguales, apoyándose en construir un triángulo equilátero sobre dos lados iguales del ángulo." },
  { codigo:"I.10", tipo:"construcción", titulo:"Bisecar un segmento",
    resumen:"Dado un segmento, se encuentra su punto medio exacto, construyendo primero un triángulo equilátero sobre él y luego bisecando uno de sus ángulos (I.9)." },
  { codigo:"I.11", tipo:"construcción", titulo:"Perpendicular desde un punto de la recta",
    resumen:"Dado un punto sobre una recta, se traza desde ahí una perpendicular, apoyándose en un triángulo equilátero construido a ambos lados del punto." },
  { codigo:"I.12", tipo:"construcción", titulo:"Perpendicular desde un punto exterior",
    resumen:"Dado un punto fuera de una recta, se traza desde él la perpendicular a esa recta, usando una circunferencia que la corta en dos puntos y bisecando la cuerda resultante." },
  { codigo:"I.13", tipo:"teorema", titulo:"Los ángulos adyacentes suman dos rectos",
    resumen:"Cuando una recta se levanta sobre otra, los dos ángulos que forma —sean iguales o no— siempre suman exactamente dos ángulos rectos." },
  { codigo:"I.14", tipo:"teorema (converso de I.13)", titulo:"Si los ángulos adyacentes suman dos rectos, hay una sola recta",
    resumen:"Si dos rectas en lados opuestos de un punto forman ángulos que suman dos rectos, en realidad son una sola recta continua, no dos distintas." },
  { codigo:"I.15", tipo:"teorema", titulo:"Ángulos opuestos por el vértice",
    resumen:"Cuando dos rectas se cruzan, los ángulos opuestos por el vértice (los que quedan en lados contrarios del cruce) son siempre iguales entre sí." },
  { codigo:"I.16", tipo:"teorema", titulo:"El ángulo externo es mayor que los internos no adyacentes",
    resumen:"Al prolongar un lado de un triángulo, el ángulo externo que se forma es mayor que cualquiera de los dos ángulos internos que no lo tocan." },
  { codigo:"I.17", tipo:"teorema", titulo:"Dos ángulos de un triángulo suman menos de dos rectos",
    resumen:"En cualquier triángulo, la suma de dos cualesquiera de sus tres ángulos es siempre menor que dos ángulos rectos." },
  { codigo:"I.18", tipo:"teorema", titulo:"El lado mayor tiene el ángulo opuesto mayor",
    resumen:"En un triángulo, si un lado es más largo que otro, el ángulo opuesto al lado más largo es también el más grande." },
  { codigo:"I.19", tipo:"teorema (converso de I.18)", titulo:"El ángulo mayor tiene el lado opuesto mayor",
    resumen:"El recíproco de I.18: si un ángulo es mayor que otro, el lado opuesto a ese ángulo mayor es también el más largo." },
  { codigo:"I.20", tipo:"teorema", titulo:"Desigualdad triangular",
    resumen:"En todo triángulo, la suma de dos lados cualesquiera es siempre mayor que el tercer lado — no se puede «atajar en línea recta» y ganar distancia." },
  { codigo:"I.21", tipo:"teorema", titulo:"Segmentos interiores menores pero ángulo mayor",
    resumen:"Si desde los extremos de un lado de un triángulo se trazan dos rectas que se encuentran dentro de él, esas rectas son más cortas que los otros dos lados, pero forman un ángulo mayor." },
  { codigo:"I.22", tipo:"construcción", titulo:"Construir un triángulo con tres segmentos dados",
    resumen:"Dados tres segmentos (donde dos cualesquiera juntos superan al tercero), se construye un triángulo cuyos lados sean exactamente esos tres segmentos." },
  { codigo:"I.23", tipo:"construcción", titulo:"Copiar un ángulo sobre una recta dada",
    resumen:"Dado un ángulo y una recta con un punto en ella, se construye en ese punto un ángulo idéntico al dado." },
  { codigo:"I.24", tipo:"teorema", titulo:"LAL con ángulo mayor implica base mayor",
    resumen:"Si dos triángulos tienen dos lados respectivamente iguales pero uno tiene el ángulo comprendido mayor, ese triángulo también tiene la base (el tercer lado) mayor." },
  { codigo:"I.25", tipo:"teorema (converso de I.24)", titulo:"Base mayor implica ángulo comprendido mayor",
    resumen:"El recíproco de I.24: si dos triángulos tienen dos lados iguales pero uno tiene la base mayor, ese triángulo también tiene el ángulo comprendido mayor." },
  { codigo:"I.26", tipo:"teorema (ALA y LLA)", titulo:"Congruencia por ángulo-lado-ángulo",
    resumen:"Si dos triángulos tienen dos ángulos respectivamente iguales y un lado igual (ya sea el común a esos ángulos, o el opuesto a uno de ellos), son completamente congruentes." },
  { codigo:"I.27", tipo:"teorema", titulo:"Ángulos alternos iguales implican rectas paralelas",
    resumen:"Si una recta corta a otras dos formando ángulos alternos iguales entre sí, esas dos rectas son paralelas." },
  { codigo:"I.28", tipo:"teorema", titulo:"Ángulos correspondientes iguales implican paralelas",
    resumen:"Si una recta corta a otras dos formando el ángulo externo igual al interno opuesto del mismo lado (o los internos del mismo lado suman dos rectos), las dos rectas son paralelas." },
  { codigo:"I.29", tipo:"teorema", titulo:"Converso de I.27/28 — usa el Postulado de las paralelas",
    resumen:"Una recta que corta a dos rectas paralelas forma ángulos alternos iguales, ángulos correspondientes iguales, e internos del mismo lado que suman dos rectos. Es la primera proposición que usa el Postulado 5." },
  { codigo:"I.30", tipo:"teorema", titulo:"Transitividad del paralelismo",
    resumen:"Dos rectas que son paralelas a una misma tercera recta son también paralelas entre sí." },
  { codigo:"I.31", tipo:"construcción", titulo:"Trazar una paralela por un punto dado",
    resumen:"Dado un punto y una recta, se traza por ese punto una recta paralela a la dada, copiando un ángulo adecuado." },
  { codigo:"I.32", tipo:"teorema", titulo:"Suma de los ángulos internos de un triángulo",
    resumen:"El ángulo externo de un triángulo es igual a la suma de los dos ángulos internos no adyacentes; y los tres ángulos internos de cualquier triángulo, juntos, son siempre iguales a dos ángulos rectos." },
  { codigo:"I.33", tipo:"teorema", titulo:"Segmentos que unen extremos de iguales y paralelos",
    resumen:"Si se unen, por el mismo lado, los extremos de dos segmentos iguales y paralelos, los segmentos resultantes son también iguales y paralelos entre sí." },
  { codigo:"I.34", tipo:"teorema", titulo:"Propiedades del paralelogramo",
    resumen:"En un paralelogramo, los lados opuestos son iguales, los ángulos opuestos son iguales, y la diagonal lo divide en dos triángulos congruentes." },
  { codigo:"I.35", tipo:"teorema", titulo:"Paralelogramos iguales en área sobre la misma base",
    resumen:"Dos paralelogramos que comparten la misma base y están entre las mismas dos rectas paralelas tienen exactamente la misma área, aunque no sean congruentes entre sí. Primera proposición sobre igualdad de áreas." },
  { codigo:"I.36", tipo:"teorema", titulo:"Paralelogramos iguales en área sobre bases iguales",
    resumen:"Extiende I.35: dos paralelogramos con bases iguales (no necesariamente la misma base) entre las mismas paralelas, también tienen la misma área." },
  { codigo:"I.37", tipo:"teorema", titulo:"Triángulos iguales en área sobre la misma base",
    resumen:"Dos triángulos que comparten la misma base y tienen su vértice opuesto en la misma paralela a esa base, tienen exactamente la misma área." },
  { codigo:"I.38", tipo:"teorema", titulo:"Triángulos iguales en área sobre bases iguales",
    resumen:"Extiende I.37: dos triángulos con bases iguales (distintas) entre las mismas paralelas, también tienen la misma área." },
  { codigo:"I.39", tipo:"teorema (converso de I.37)", titulo:"Área igual y misma base implican mismas paralelas",
    resumen:"Si dos triángulos con la misma base tienen áreas iguales, sus vértices opuestos están necesariamente en la misma paralela a esa base." },
  { codigo:"I.40", tipo:"teorema (converso de I.38)", titulo:"Área igual y bases iguales implican mismas paralelas",
    resumen:"El análogo de I.39 para bases iguales pero distintas: si las áreas coinciden, los vértices están en la misma paralela." },
  { codigo:"I.41", tipo:"teorema", titulo:"El paralelogramo es el doble del triángulo",
    resumen:"Si un paralelogramo y un triángulo comparten la misma base y están entre las mismas paralelas, el paralelogramo tiene exactamente el doble del área del triángulo." },
  { codigo:"I.42", tipo:"construcción", titulo:"Paralelogramo igual a un triángulo, con ángulo dado",
    resumen:"Dado un triángulo y un ángulo, se construye un paralelogramo con esa área y ese ángulo, bisecando un lado del triángulo y copiando el ángulo sobre él." },
  { codigo:"I.43", tipo:"teorema", titulo:"Los complementos de un paralelogramo son iguales",
    resumen:"Al trazar la diagonal de un paralelogramo y dos paralelas a los lados por un punto de esa diagonal, las dos regiones «complementarias» resultantes tienen siempre la misma área." },
  { codigo:"I.44", tipo:"construcción", titulo:"Aplicar un paralelogramo a una recta, igual a un triángulo",
    resumen:"Dada una recta, un ángulo y un triángulo, se construye sobre esa recta exacta (no en otro lugar) un paralelogramo con ese ángulo, igual en área al triángulo — usando la técnica de los complementos iguales (I.43)." },
  { codigo:"I.45", tipo:"construcción", titulo:"Paralelogramo igual a una figura rectilínea cualquiera",
    resumen:"Dado un polígono cualquiera y un ángulo, se construye un paralelogramo con esa área, descomponiendo el polígono en triángulos y aplicando I.44 a cada uno." },
  { codigo:"I.46", tipo:"construcción", titulo:"Construir un cuadrado sobre una recta dada",
    resumen:"Dado un segmento, se construye sobre él un cuadrado exacto, usando una perpendicular (I.11) y dos paralelas (I.31)." },
  { codigo:"I.47", tipo:"teorema", titulo:"Teorema de Pitágoras",
    resumen:"En un triángulo rectángulo, el cuadrado construido sobre la hipotenusa tiene exactamente la misma área que la suma de los cuadrados construidos sobre los dos catetos. El teorema más célebre del Libro I, demostrado mediante comparación de áreas, sin usar números." },
  { codigo:"I.48", tipo:"teorema (converso de I.47)", titulo:"Converso del Teorema de Pitágoras",
    resumen:"Si en un triángulo el cuadrado de un lado es igual a la suma de los cuadrados de los otros dos, el ángulo comprendido entre esos otros dos lados es necesariamente recto. Cierra el Libro I." }
]

};

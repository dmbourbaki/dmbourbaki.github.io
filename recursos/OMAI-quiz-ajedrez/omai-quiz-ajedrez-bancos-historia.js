// omai-quiz-ajedrez-bancos-historia.js
// Banco de preguntas de Historia del Ajedrez, parte de OMAI-Quiz Ajedrez.
// Enfoque: jugadores, anécdotas, campeonatos mundiales y aperturas/defensas,
// pensado como cultura general ajedrecista (no arqueología del juego).

const BANCOS_HISTORIA = [
  {
    id: "aj-historia",
    area: "Historia del Ajedrez",
    nombre: "Historia, Jugadores y Cultura Ajedrecista",
    preguntas: [
      // ---- Raíces (mínimo indispensable) ----
      {
        texto: "¿En qué región se originó el antecesor más antiguo conocido del ajedrez, llamado 'chaturanga'?",
        opciones: ["El subcontinente indio", "La península ibérica", "Escandinavia", "Egipto"],
        correcta: 0,
        nivel: "basico",
        imagen: null,
      },
      {
        texto: "¿Qué cambio de reglas en Europa, a finales del siglo XV, dio origen al ajedrez tal como se juega hoy?",
        opciones: ["La dama y el alfil ganaron gran movilidad (la dama se volvió la pieza más poderosa)", "Se eliminó el enroque", "El tablero pasó de 64 a 100 casillas", "Se prohibió la promoción de peones"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },

      // ---- Philidor ----
      {
        texto: "François-André Danican Philidor, la figura más fuerte del ajedrez del siglo XVIII, es célebre por su frase sobre esta parte del tablero:",
        opciones: ["'Los peones son el alma del ajedrez'", "'La dama nunca debe moverse temprano'", "'El caballo en la orilla apesta'", "'El rey es una pieza de ataque en el final'"],
        correcta: 0,
        nivel: "basico",
        imagen: "imagenes/aj-hist-01-philidor.png",
      },
      {
        texto: "Además de ajedrecista, ¿en qué otra disciplina artística destacó Philidor, siendo esta faceta anterior a su fama ajedrecística?",
        opciones: ["Fue un reconocido compositor de ópera", "Fue pintor retratista", "Fue poeta y dramaturgo", "Fue arquitecto"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },
      {
        texto: "¿Qué hazaña relacionada con el ajedrez a ciegas hizo famoso a Philidor en su época?",
        opciones: ["Jugaba varias partidas simultáneas sin ver los tableros", "Ganó un torneo jugando con los ojos vendados literalmente", "Inventó el reloj de ajedrez", "Fue el primero en anotar partidas completas"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },

      // ---- Staunton ----
      {
        texto: "¿Por qué el nombre de Howard Staunton, dominante en la década de 1840-1850, sigue presente en el ajedrez actual?",
        opciones: ["El diseño estándar de piezas usado en torneos oficiales lleva su nombre ('piezas Staunton')", "Inventó la notación algebraica moderna", "Fue el primer campeón mundial oficial de la FIDE", "Creó el sistema de puntuación Elo"],
        correcta: 0,
        nivel: "basico",
        imagen: "imagenes/aj-hist-02-staunton.png",
      },
      {
        texto: "¿Qué evento organizado por Staunton en 1851 es considerado el primer gran torneo internacional de ajedrez de la historia?",
        opciones: ["El torneo de Londres de 1851", "El primer Campeonato Mundial de la FIDE", "El torneo de San Petersburgo", "La primera Olimpiada de Ajedrez"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },

      // ---- Morphy ----
      {
        texto: "Paul Morphy, el genio estadounidense de mediados del siglo XIX, es recordado sobre todo por:",
        opciones: ["Su dominio absoluto del ajedrez de ataque y desarrollo rápido de piezas, retirándose joven en la cima", "Haber sido el primer campeón mundial oficial de la FIDE", "Inventar la apertura española", "Haber vivido más de 90 años dedicado al ajedrez"],
        correcta: 0,
        nivel: "basico",
        imagen: "imagenes/aj-hist-03-morphy.png",
      },
      {
        texto: "¿Qué ocurrió con la carrera ajedrecística de Morphy después de su gira triunfal por Europa en 1858?",
        opciones: ["Se retiró prematuramente del ajedrez competitivo, considerándolo poco digno como profesión seria", "Fundó la primera federación internacional de ajedrez", "Se convirtió en el primer campeón mundial oficial", "Jugó activamente hasta una edad avanzada"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },
      {
        texto: "La célebre 'Partida de la Ópera' (1858), uno de los ejemplos más citados de desarrollo rápido y sacrificio, fue jugada por Morphy en:",
        opciones: ["Un palco de ópera en París, contra dos nobles que jugaban en pareja", "El primer Campeonato Mundial", "Un match por correspondencia", "Una simultánea a ciegas en Londres"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Steinitz y el título mundial ----
      {
        texto: "¿Quién es considerado, según los registros históricos, el primer Campeón Mundial de Ajedrez oficial (1886)?",
        opciones: ["Wilhelm Steinitz", "Emanuel Lasker", "Paul Morphy", "Howard Staunton"],
        correcta: 0,
        nivel: "intermedio",
        imagen: "imagenes/aj-hist-04-steinitz.png",
      },
      {
        texto: "¿Qué aporte teórico se le atribuye principalmente a Steinitz, considerado el 'padre del ajedrez posicional'?",
        opciones: ["Sistematizar principios posicionales (ventajas pequeñas y acumulables) frente al ajedrez puramente de ataque", "Inventar el enroque largo", "Crear el sistema de clasificación Elo", "Fundar la FIDE"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Lasker ----
      {
        texto: "Emanuel Lasker ostentó el título mundial por 27 años (1894-1921), el reinado más largo de la historia. Además de ajedrecista, ¿en qué campo académico también dejó un aporte reconocido?",
        opciones: ["Las matemáticas: se le atribuye un resultado importante en álgebra conmutativa (relacionado con la descomposición de ideales)", "La física cuántica", "La medicina", "La arquitectura"],
        correcta: 0,
        nivel: "aplicado",
        imagen: "imagenes/aj-hist-05-lasker.png",
      },
      {
        texto: "¿Cómo se conoce el teorema de descomposición de ideales en anillos conmutativos en el que Lasker hizo un aporte pionero, más tarde generalizado por Emmy Noether?",
        opciones: ["El teorema de Lasker-Noether", "El teorema de Lasker-Steinitz", "El teorema fundamental del ajedrez", "El teorema de la oposición"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Capablanca ----
      {
        texto: "José Raúl Capablanca, campeón mundial entre 1921 y 1927, era de:",
        opciones: ["Cuba", "España", "Argentina", "Rusia"],
        correcta: 0,
        nivel: "basico",
        imagen: "imagenes/aj-hist-06-capablanca.png",
      },
      {
        texto: "¿Por qué se destacó el estilo de Capablanca como excepcionalmente 'natural'?",
        opciones: ["Por su capacidad para jugar con enorme claridad y aparente facilidad, con muy pocos errores y sin necesidad de estudiar mucho las aperturas", "Porque fue el primero en usar un reloj digital", "Porque construyó una máquina que jugaba ajedrez", "Porque jugaba exclusivamente finales de torres"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },
      {
        texto: "Capablanca llegó a proponer, preocupado por el creciente número de tablas entre grandes maestros, una variante con un tablero más grande y piezas nuevas. ¿Cómo se conoce esa variante?",
        opciones: ["Ajedrez Capablanca (con canciller y arzobispo en un tablero de 10x8)", "Ajedrez de Fischer (Chess960)", "Ajedrez rápido", "Ajedrez de tres tableros"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Alekhine ----
      {
        texto: "Alexander Alekhine, quien arrebató el título a Capablanca en 1927, es el único campeón mundial que:",
        opciones: ["Murió siendo campeón mundial, sin haber perdido el título en un match", "Nunca perdió una partida en toda su carrera", "Fue campeón por menos de un año", "Jugó todas sus partidas a ciegas"],
        correcta: 0,
        nivel: "intermedio",
        imagen: "imagenes/aj-hist-07-alekhine.png",
      },
      {
        texto: "¿En qué país murió Alekhine en 1946, en circunstancias que aún generan debate histórico, poco después de la Segunda Guerra Mundial?",
        opciones: ["Portugal", "Rusia", "Estados Unidos", "Cuba"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Euwe ----
      {
        texto: "Max Euwe, campeón mundial entre 1935 y 1937 tras vencer a Alekhine, era de origen:",
        opciones: ["Neerlandés (Países Bajos)", "Alemán", "Belga", "Sueco"],
        correcta: 0,
        nivel: "basico",
        imagen: "imagenes/aj-hist-08-euwe.png",
      },
      {
        texto: "Al igual que Lasker, Euwe combinó el ajedrez de alto nivel con una sólida carrera académica. ¿En qué campo se doctoró y qué cargo llegó a ocupar más tarde vinculado al ajedrez internacional?",
        opciones: ["Se doctoró en matemáticas y más tarde fue presidente de la FIDE", "Se doctoró en física y fue rector de universidad sin relación con la FIDE", "Estudió medicina y fue médico de la selección nacional", "Estudió derecho y fue árbitro principal de la FIDE"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Botvinnik y escuela soviética ----
      {
        texto: "Mijaíl Botvinnik, campeón mundial en varias ocasiones entre 1948 y 1963, es considerado el fundador de:",
        opciones: ["La escuela soviética de ajedrez, con entrenamiento sistemático y científico", "El ajedrez rápido moderno", "La notación algebraica", "El sistema de clasificación Elo"],
        correcta: 0,
        nivel: "intermedio",
        imagen: "imagenes/aj-hist-09-botvinnik.png",
      },
      {
        texto: "Además de ajedrecista, Botvinnik tuvo una carrera formal como ingeniero especializado en:",
        opciones: ["Ingeniería eléctrica, y más tarde trabajó en inteligencia artificial aplicada al ajedrez", "Ingeniería civil", "Ingeniería aeroespacial", "Ingeniería química"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Smyslov ----
      {
        texto: "Vasili Smyslov, campeón mundial en 1957, fue célebre no solo por su técnica extraordinaria en los finales, sino también por su talento en:",
        opciones: ["El canto: fue un barítono con formación de ópera que llegó a hacer audiciones profesionales", "La pintura al óleo", "La composición de problemas de matemáticas", "La escritura de novelas de ciencia ficción"],
        correcta: 0,
        nivel: "intermedio",
        imagen: "imagenes/aj-hist-10-smyslov.png",
      },
      {
        texto: "¿Por qué se considera a Smyslov uno de los mayores virtuosos históricos de los finales de partida?",
        opciones: ["Por su capacidad para explotar ventajas mínimas con precisión técnica extrema, especialmente en finales de piezas menores y torres", "Porque nunca jugó una apertura teórica en toda su carrera", "Porque siempre buscaba tablas desde la apertura", "Porque solo jugaba finales de peones"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Tal ----
      {
        texto: "Mijaíl Tal, campeón mundial en 1960 y apodado 'el Mago de Riga', es recordado por su estilo:",
        opciones: ["Extremadamente agresivo y de sacrificios intuitivos, a menudo difíciles de refutar incluso para sus rivales", "Puramente posicional y de pocos riesgos", "Basado exclusivamente en finales de torres", "Centrado en jugar siempre a la defensiva"],
        correcta: 0,
        nivel: "basico",
        imagen: "imagenes/aj-hist-11-tal.png",
      },
      {
        texto: "La salud de Tal fue frágil durante buena parte de su vida debido a problemas renales; falleció en 1992 a una edad relativamente temprana. ¿Aproximadamente a qué edad murió?",
        opciones: ["55 años", "70 años", "40 años", "80 años"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Petrosian, Spassky ----
      {
        texto: "Tigran Petrosián, campeón mundial entre 1963 y 1969, era reconocido por un estilo casi opuesto al de Tal, centrado en:",
        opciones: ["La profilaxis y la prevención extrema de las amenazas rivales antes de atacar", "El sacrificio constante de material", "Jugar siempre aperturas abiertas y tácticas", "Evitar el enroque en toda circunstancia"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },
      {
        texto: "Borís Spassky, campeón mundial de 1969 a 1972, es recordado especialmente por protagonizar, como perdedor, uno de los matches más famosos de la historia. ¿Contra quién?",
        opciones: ["Bobby Fischer, en el 'Match del Siglo' de 1972 en Reikiavik", "Anatoli Kárpov, en 1975", "Garri Kaspárov, en 1985", "Mijaíl Tal, en 1960"],
        correcta: 0,
        nivel: "basico",
        imagen: null,
      },

      // ---- Fischer ----
      {
        texto: "¿Qué simbolizaba, en plena Guerra Fría, el 'Match del Siglo' de 1972 entre Bobby Fischer (EE. UU.) y Borís Spassky (URSS)?",
        opciones: ["La rivalidad geopolítica entre ambos bloques, más allá del propio tablero", "La primera vez que se jugó ajedrez con reloj", "El estreno oficial de la notación algebraica", "La fundación de la FIDE"],
        correcta: 0,
        nivel: "intermedio",
        imagen: "imagenes/aj-hist-12-fischer-spassky.png",
      },
      {
        texto: "Tras ganar el título mundial en 1972, ¿qué decisión inusual tomó Fischer respecto a su reinado como campeón?",
        opciones: ["Se negó a defender el título en 1975 ante Kárpov por desacuerdos con las condiciones, y perdió la corona sin jugar", "Defendió el título anualmente hasta 1985", "Renunció al ajedrez profesional inmediatamente tras coronarse", "Cedió el título voluntariamente a Spassky en la revancha"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Karpov, Korchnoi ----
      {
        texto: "Anatoli Kárpov se convirtió en campeón mundial en 1975 en circunstancias particulares. ¿Cómo obtuvo el título?",
        opciones: ["Por default, al no disputarse el match contra Fischer, quien no defendió la corona", "Derrotando a Fischer en un match muy reñido", "Ganando un torneo de eliminación directa", "Por decisión unánime de un comité de grandes maestros"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },
      {
        texto: "Los matches entre Kárpov y el disidente soviético Víktor Korchnói en 1978 y 1981 fueron notables por su intensa carga:",
        opciones: ["Política, dado que Korchnói había desertado de la URSS y el enfrentamiento trascendió lo puramente deportivo", "Religiosa, por diferencias de credo entre ambos", "Generacional, al ser Korchnói mucho más joven que Kárpov", "Ninguna de las anteriores; fueron matches sin trasfondo alguno"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Kaspárov ----
      {
        texto: "Garri Kaspárov y Anatoli Kárpov protagonizaron una serie de cinco matches consecutivos por el título mundial entre 1984 y 1990, la rivalidad más extensa de la historia del ajedrez de élite.",
        opciones: ["Verdadero: fueron cinco matches por el título mundial entre ambos", "Falso: solo disputaron un match por el título", "Falso: fueron matches por el subcampeonato, no por el título mundial", "Falso: la rivalidad fue exclusivamente en torneos, nunca en matches por el título"],
        correcta: 0,
        nivel: "intermedio",
        imagen: "imagenes/aj-hist-13-kasparov-karpov.png",
      },
      {
        texto: "¿Qué hito histórico ocurrió en 1997 relacionado con Kaspárov y que marcó un antes y un después en la relación entre ajedrez e inteligencia artificial?",
        opciones: ["La computadora Deep Blue de IBM lo derrotó en un match oficial a 6 partidas", "Kaspárov se convirtió en el primer campeón mundial en jugar en línea", "Se prohibió por primera vez el uso de computadoras en torneos", "Kaspárov fundó la primera plataforma de ajedrez en internet"],
        correcta: 0,
        nivel: "basico",
        imagen: null,
      },

      // ---- Kramnik, Anand ----
      {
        texto: "Vladímir Krámnik le arrebató el título mundial 'clásico' a Kaspárov en el año 2000. ¿Qué aportación teórica de apertura se le asocia especialmente, usada para neutralizar la Ruy López?",
        opciones: ["La Defensa Berlinesa (variante Berlín de la Ruy López)", "La Defensa Siciliana", "El Gambito de Rey", "La Apertura Inglesa"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },
      {
        texto: "Viswanathan Anand, campeón mundial en varias ocasiones entre 2000 y 2013, es reconocido históricamente como:",
        opciones: ["El primer gran campeón mundial surgido de India, pionero del ajedrez de élite en su país", "El primer campeón mundial de origen africano", "El inventor del ajedrez rápido moderno", "El primer campeón en jugar exclusivamente en línea"],
        correcta: 0,
        nivel: "basico",
        imagen: null,
      },

      // ---- Carlsen ----
      {
        texto: "Magnus Carlsen, campeón mundial entre 2013 y 2023 (año en que decidió no defender el título), es de:",
        opciones: ["Noruega", "Suecia", "Islandia", "Dinamarca"],
        correcta: 0,
        nivel: "basico",
        imagen: "imagenes/aj-hist-14-carlsen.png",
      },
      {
        texto: "¿Qué récord histórico de puntuación Elo en ajedrez clásico ha ostentado Carlsen?",
        opciones: ["La mayor puntuación Elo alcanzada en la historia del ajedrez clásico", "El mayor número de partidas jugadas en un año", "El campeonato más joven de la historia", "El mayor número de tablas consecutivas"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },

      // ---- Mujeres en el ajedrez ----
      {
        texto: "Judit Polgár, considerada la mejor ajedrecista femenina de la historia hasta la fecha, se destacó especialmente por:",
        opciones: ["Competir y ganar de forma sostenida contra los mejores jugadores masculinos del mundo, llegando al top 10 mundial absoluto", "Ser la primera mujer en jugar un torneo oficial de ajedrez", "Fundar la Federación Internacional de Ajedrez Femenino", "Ser la primera campeona mundial femenina de la historia"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },
      {
        texto: "¿Quién fue la primera Campeona Mundial Femenina de Ajedrez oficial, título obtenido en 1927?",
        opciones: ["Vera Menchik", "Judit Polgár", "Nona Gaprindashvili", "Zsuzsa Polgár"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },

      // ---- Aperturas y defensas ----
      {
        texto: "La Apertura Ruy López (o Apertura Española) debe su nombre a:",
        opciones: ["Ruy López de Segura, un clérigo español del siglo XVI que la analizó en uno de los primeros tratados de ajedrez", "Un campeón mundial español del siglo XX", "La ciudad española donde se disputó el primer campeonato mundial", "Un fabricante de piezas de ajedrez de Madrid"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },
      {
        texto: "La Defensa Siciliana, una de las respuestas más populares y agudas contra 1.e4, recibe ese nombre por:",
        opciones: ["Haber sido analizada y documentada tempranamente por ajedrecistas y tratadistas italianos, entre ellos de Sicilia", "Haber sido inventada por un campeón mundial siciliano", "Ser la apertura oficial de los torneos de Sicilia", "Ser una variante exclusiva del ajedrez postal italiano"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },
      {
        texto: "¿Qué caracteriza a la Defensa Francesa como respuesta a 1.e4?",
        opciones: ["Las negras responden 1...e6, preparando 2...d5 para desafiar el centro, aceptando cierta rigidez estructural a cambio de solidez", "Las negras capturan inmediatamente el peón de e4", "Es una defensa que evita mover peones centrales durante toda la apertura", "Es exclusiva de partidas por correspondencia"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },
      {
        texto: "La Defensa Caro-Kann (1.e4 c6) debe su nombre a:",
        opciones: ["Los analistas Horatio Caro y Marcus Kann, quienes la estudiaron a finales del siglo XIX", "Un campeón mundial de origen austríaco", "Una ciudad de Europa del Este", "Un torneo disputado en Viena en 1900"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },
      {
        texto: "El Gambito de Dama (1.d4 d5 2.c4), una de las aperturas más antiguas y respetadas del ajedrez clásico, ofrece:",
        opciones: ["Un peón lateral (el de la columna c) a cambio de mayor control central e iniciativa, no necesariamente la dama misma", "La dama a cambio de dos piezas menores", "Sacrificar el enroque a cambio de desarrollo", "Un peón central inmediato sin compensación"],
        correcta: 0,
        nivel: "basico",
        imagen: null,
      },
      {
        texto: "La Defensa India de Rey, popular sobre todo desde mediados del siglo XX, se caracteriza por:",
        opciones: ["Que las negras ceden el centro inicialmente con fianchetto de alfil en g7, para contraatacarlo más tarde con peones", "Que el rey se mueve a la India antes de enrocar", "Ser una apertura exclusiva de jugadores indios", "Evitar por completo el desarrollo de piezas menores"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },
      {
        texto: "La Defensa Nimzo-India, que lleva el nombre del gran teórico Aron Nimzowitsch, se inicia típicamente con los movimientos:",
        opciones: ["1.d4 Cf6 2.c4 e6 3.Cc3 Ab4, clavando el caballo blanco", "1.e4 e5 2.Cf3 Cc6 3.Ab5", "1.d4 d5 2.c4 dxc4", "1.e4 c5 2.Cf3 d6"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },
      {
        texto: "¿Qué aportó Aron Nimzowitsch, autor del influyente libro 'Mi sistema', al pensamiento estratégico moderno del ajedrez?",
        opciones: ["Conceptos como la profilaxis, el bloqueo de peones y la sobreprotección de puntos clave", "La notación algebraica moderna", "El sistema de desempate por tiempo", "El diseño estándar de las piezas de torneo"],
        correcta: 0,
        nivel: "aplicado",
        imagen: null,
      },
      {
        texto: "La Apertura Inglesa (1.c4) recibe su nombre porque:",
        opciones: ["Fue popularizada en Inglaterra, entre otros, por Howard Staunton en el siglo XIX", "Fue inventada por un campeón mundial inglés en el siglo XX", "Solo puede jugarse en torneos organizados en Inglaterra", "Fue prohibida en el resto de Europa durante un tiempo"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },

      // ---- Cultura general / anécdotas ----
      {
        texto: "¿En qué año se fundó la FIDE (Federación Internacional de Ajedrez), organismo rector mundial del juego?",
        opciones: ["1924, en París", "1886, en Londres", "1948, en Moscú", "1972, en Reikiavik"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },
      {
        texto: "¿Qué es la Olimpiada de Ajedrez, evento organizado por la FIDE desde 1927?",
        opciones: ["Una competencia por equipos nacionales, disputada cada dos años, considerada el mayor evento colectivo del ajedrez mundial", "El torneo individual que define al campeón mundial", "Una competencia exclusiva de ajedrez rápido", "Un evento exclusivo para jugadores menores de 20 años"],
        correcta: 0,
        nivel: "intermedio",
        imagen: null,
      },
      {
        texto: "¿Qué fenómeno cultural masivo relacionado con el ajedrez ocurrió en 2020, atribuido en parte a una producción televisiva?",
        opciones: ["Un aumento explosivo del interés público por el ajedrez, impulsado por la serie 'Gambito de Dama' (The Queen's Gambit)", "La creación del primer campeonato mundial femenino", "El primer campeonato mundial disputado completamente en línea", "La legalización internacional de las apuestas en ajedrez"],
        correcta: 0,
        nivel: "basico",
        imagen: null,
      },
      {
        texto: "¿Cuál es la partida más corta posible que termina en jaque mate, conocida popularmente como 'mate del loco' o 'fool's mate'?",
        opciones: ["Solo dos jugadas por bando (por ejemplo 1.f3 e5 2.g4 Dh4#)", "Cuatro jugadas por bando", "Una sola jugada de cada bando", "No existe un mate en tan pocas jugadas"],
        correcta: 0,
        nivel: "basico",
        imagen: null,
      },
      {
        texto: "¿Qué avance tecnológico transformó profundamente la manera de estudiar y difundir el ajedrez a partir de la década de 2010?",
        opciones: ["Las plataformas de ajedrez en línea y los motores de análisis accesibles al público general", "La invención del reloj de ajedrez mecánico", "La estandarización internacional del tamaño del tablero", "La creación de la notación descriptiva inglesa"],
        correcta: 0,
        nivel: "basico",
        imagen: null,
      },
    ],
  },
];

export { BANCOS_HISTORIA };

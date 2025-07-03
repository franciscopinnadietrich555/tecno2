
let mic, pitch, audioContext;
let gestorAmp, gestorPitch;

let FREC_MIN = 80;
let FREC_MAX = 1000;
let AMP_MIN = 0.01;
let AMP_MAX = 0.3;

let estado = "esperando";
let haySonido = false;
let antesHabiaSonido = false;

let lineasEnPantalla = [];
let lineasEstaticas = [];

let coloresDisponibles = {
  horizontal: ["red", "blue", "yellow"],
  vertical: ["red", "blue", "yellow"]
};

let cantidadPorEje = { horizontal: 0, vertical: 0 };
let maxLineasPorEje = 10;

let tiempoSilencio = 0;
let tiempoReinicio = 5000;
let marcaSilencio = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  audioContext = getAudioContext();

  mic = new p5.AudioIn();
  mic.start(() => {
    console.log("Micrófono activado");
    startPitch();
  });

  gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX);
  gestorPitch = new GestorSenial(FREC_MIN, FREC_MAX);
}

function draw() {
  background(255);

  let vol = mic.getLevel();
  gestorAmp.actualizar(vol);

  haySonido = gestorAmp.filtrada > 0.1;
  let inicioSonido = haySonido && !antesHabiaSonido;
  let finSonido = !haySonido && antesHabiaSonido;

  if (inicioSonido && estado === "esperando") {
    let eje = elegirEjeDisponible();
    if (eje) {
      let color = elegirColor(eje);
      if (color) {
        let cantidad = vol > 0.1 ? 6 : 2;
        let nueva = new LineaMondrian(eje, color, cantidad);
        lineasEnPantalla.push(nueva);
      }
    }
    estado = "hablando";
  }

  if (finSonido && estado === "hablando") {
    lineasEnPantalla.forEach(l => {
      let antes = l.lineas.length;
      l.detenerSiNoSuperpone(lineasEstaticas);
      if (l.lineas.length > 0 && cantidadPorEje[l.eje] < maxLineasPorEje) {
        cantidadPorEje[l.eje]++;
      }
    });

    lineasEnPantalla = lineasEnPantalla.filter(l => l.lineas.length > 0);
    estado = "esperando";

    if (!puedeAgregarMasLineas()) {
      marcaSilencio = millis();
    }
  }

  if (!haySonido && estado === "esperando" && !puedeAgregarMasLineas()) {
    if (millis() - marcaSilencio > tiempoReinicio) {
      reiniciarObra();
    }
  }

  // Dibujar líneas ya detenidas
  strokeWeight(15);
  for (let l of lineasEstaticas) {
    stroke(l.color);
    if (l.eje === "horizontal") {
      line(0, l.pos, width, l.pos);
    } else {
      line(l.pos, 0, l.pos, height);
    }
  }

  for (let l of lineasEnPantalla) l.dibujar();

  antesHabiaSonido = haySonido;
}

function startPitch() {
  const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
  pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, () => {
    console.log("Modelo de pitch cargado");
    getPitch();
  });
}

function getPitch() {
  pitch.getPitch((err, frequency) => {
    if (frequency) gestorPitch.actualizar(frequency);
    getPitch();
  });
}

function elegirEjeDisponible() {
  const ejes = [];
  if (cantidadPorEje.horizontal < maxLineasPorEje && coloresDisponibles.horizontal.length > 0)
    ejes.push("horizontal");
  if (cantidadPorEje.vertical < maxLineasPorEje && coloresDisponibles.vertical.length > 0)
    ejes.push("vertical");

  if (ejes.length === 0) return null;
  return random(ejes);
}

function elegirColor(eje) {
  if (coloresDisponibles[eje].length === 0) return null;
  return coloresDisponibles[eje].splice(floor(random(coloresDisponibles[eje].length)), 1)[0];
}

function puedeAgregarMasLineas() {
  return (
    (cantidadPorEje.horizontal < maxLineasPorEje && coloresDisponibles.horizontal.length > 0) ||
    (cantidadPorEje.vertical < maxLineasPorEje && coloresDisponibles.vertical.length > 0)
  );
}

function reiniciarObra() {
  lineasEnPantalla = [];
  lineasEstaticas = [];
  cantidadPorEje = { horizontal: 0, vertical: 0 };
  coloresDisponibles = {
    horizontal: ["red", "blue", "yellow"],
    vertical: ["red", "blue", "yellow"]
  };
  estado = "esperando";
}


class LineaMondrian {
  constructor(eje, color, cantidad, grosor = 15) {
    this.eje = eje;
    this.color = color;
    this.grosor = grosor;
    this.lineas = [];
    this.direcciones = [];
    this.moviendo = true;

    const limite = this.eje === "horizontal" ? height : width;

    for (let i = 0; i < cantidad; i++) {
      const pos = random(limite);
      this.lineas.push(pos);
      this.direcciones.push(random([-1, 1]));
    }
  }

  detenerSiNoSuperpone(lineasEstaticas) {
    this.moviendo = false;
    let nuevasLineas = [];

    for (let i = 0; i < this.lineas.length; i++) {
      const pos = this.lineas[i];
      let conflicto = false;

      for (let l of lineasEstaticas) {
        if (l.eje === this.eje && abs(l.pos - pos) < 30) {
          conflicto = true;
          break;
        }
      }

      for (let j = 0; j < nuevasLineas.length; j++) {
        if (abs(nuevasLineas[j] - pos) < 30) {
          conflicto = true;
          break;
        }
      }

      if (!conflicto) {
        nuevasLineas.push(pos);
        lineasEstaticas.push({ eje: this.eje, pos, color: this.color });
      }
    }

    this.lineas = nuevasLineas;
  }

  dibujar() {
    stroke(this.color);
    strokeWeight(this.grosor);

    for (let i = 0; i < this.lineas.length; i++) {
      const pos = this.lineas[i];

      if (this.eje === "horizontal") {
        line(0, pos, width, pos);
        if (this.moviendo) this.lineas[i] += this.direcciones[i];
      } else {
        line(pos, 0, pos, height);
        if (this.moviendo) this.lineas[i] += this.direcciones[i];
      }
    }
  }
}

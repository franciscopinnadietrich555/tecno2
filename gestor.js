
class GestorSenial {
  constructor(min, max) {
    this.min = min;
    this.max = max;
    this.cruda = 0;
    this.filtrada = 0;
  }

  actualizar(nueva) {
    this.cruda = nueva;
    this.filtrada = map(nueva, this.min, this.max, 0, 1);
    this.filtrada = constrain(this.filtrada, 0, 1);
  }
}

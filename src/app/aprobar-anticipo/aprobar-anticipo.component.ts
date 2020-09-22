import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-aprobar-anticipo',
  templateUrl: './aprobar-anticipo.component.html',
  styleUrls: ['./aprobar-anticipo.component.css']
})
export class AprobarAnticipoComponent implements OnInit {
  columnsDetalle: string[] = ['Tipo', 'Descripcion', 'Cantidad', 'Moneda', 'ValorUnitario', 'ValorTotal']
  pendiente;
  pendienteArr = [];
  detalleAnticipo;
  totalPesos: number;
  totalDolares: number;
  totalEuros: number;

  constructor() { }

  ngOnInit(): void {
    this.pendiente = JSON.parse(sessionStorage.getItem('pendiente'));
    console.log(this.pendiente);
    this.pendienteArr.push(this.pendiente.pendiente);
    console.log(this.pendienteArr);
    this.detalleAnticipo = JSON.parse(this.pendiente.pendiente.DetalleAnticipo);
    console.log(this.detalleAnticipo);
    // console.table(this.pendiente);
    this.totalPesos = this.SumarTotales(this.detalleAnticipo, 'Peso');
    this.totalDolares = this.SumarTotales(this.detalleAnticipo, 'Dolar');
    this.totalEuros = this.SumarTotales(this.detalleAnticipo, 'Euro');
  }

  SumarTotales(arr, moneda: string) {
    let suma = 0;
    let filterArr;
    filterArr = arr.filter((x) => {
      return x.moneda === moneda
    })
    console.log(filterArr);
    for (let i = 0; i < filterArr.length; i++) {
      let valor = filterArr[i].valorTotal
      suma = suma + valor
    }
    return suma;
  }

  Aprobar() {
    
  }

}

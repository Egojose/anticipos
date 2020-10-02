import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ServiciosService } from '../servcios/servicios.service';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-aprobar-legalizacion',
  templateUrl: './aprobar-legalizacion.component.html',
  styleUrls: ['./aprobar-legalizacion.component.css']
})
export class AprobarLegalizacionComponent implements OnInit {
  columnsDetalle: string[] = ['Tipo', 'Descripcion', 'Cantidad', 'Moneda', 'ValorTotal'];
  columnsLegalizacion: string[] = ['Tipo', 'Descripcion', 'Beneficiario', 'Moneda', 'ValorTotal', 'Origen', 'Destino', 'FechaInicio', 'FechaFin']
  displayedUnidades: string[] = ['Director', 'Ceco', 'Porcentaje'];
  displayedResumen: string[] = ['Detalle', 'Concepto', 'Pesos', 'Dolares', 'Euros'];
  pendiente: any;
  pendienteArr = [];
  detalleUnidades = [];
  detalleAnticipo: any;
  totalPesos: number;
  totalDolares: number;
  totalEuros: number;
  tipoGasto = [];
  contador: any;
  camposTransporte: boolean;
  origen: string;
  destino: string;
  fechaInicio: string;
  fechaFin: string;
  tipoDeGasto: string;
  beneficiario: string;
  descripcion: string;
  valorTotal: string;
  moneda: string;
  detalleLegalizacion = [];
  detalle = new MatTableDataSource(this.detalleLegalizacion);
  saldoPesosAfavor: string;
  saldoDolarAfavor: string;
  saldoEurosAfavor: string;
  resumenCuentas = [];
  resumen = new MatTableDataSource(this.resumenCuentas)
  detalleItemsLegalizacion: { detalle: any[]; resumen: any[]; saldoAfavor: { Peso: string; Dolar: string; Euro: string; }; };
  arrayDetalleLegalizacion = [];
  Observaciones: string;

  constructor(public router: Router, public Servicio: ServiciosService, public toastr: ToastrService, public spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    if(!sessionStorage.getItem('pendiente')) {
      this.router.navigate(['/home']);
      return;
    }
    this.pendiente = JSON.parse(sessionStorage.getItem('pendiente'));
    console.log(this.pendiente);
    this.pendienteArr.push(this.pendiente.pendiente);
    console.log(this.pendienteArr);
    this.detalleUnidades = JSON.parse(this.pendienteArr[0].Aprobadores).filter((x) => x.rol === 'Director unidad de negocio');
    this.detalleAnticipo = JSON.parse(this.pendiente.pendiente.DetalleAnticipo);
    let arrDetalle = JSON.parse(this.pendienteArr[0].DetalleLegalizacion);
    console.log(arrDetalle);
    let arrResumen = arrDetalle[0].resumen;
    console.log(arrResumen);
    arrResumen.forEach((x) => {
      this.resumenCuentas.push(x);
    })
    console.log(arrDetalle);
    console.log(arrDetalle[0])
    arrDetalle[0].detalle.forEach((x) => {
      this.detalleLegalizacion.push(x);
    })
    console.log(this.detalleLegalizacion);
    if(arrDetalle[0].saldoAfavor.Peso) this.saldoPesosAfavor = arrDetalle[0].saldoAfavor.Peso;
    if(arrDetalle[0].saldoAfavor.Dolar) this.saldoDolarAfavor = arrDetalle[0].saldoAfavor.Dolar;
    if(arrDetalle[0].saldoAfavor.Euro) this.saldoEurosAfavor = arrDetalle[0].saldoAfavor.Euro;
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

  validar(condicion: boolean, mensaje: string) {
    if(condicion) {
      this.mostrarAdvertencia(mensaje);
      return true;
    }
  }

  Rechazar() {
    this.spinner.show()
    let cuerpo = '<p>Hola</p>' + '<br>' +
    'El usuario <b>' + this.pendienteArr[0].Responsable.Title + '</b> ha rechazado la legalización del anticipo y es necesario que haga algunas modificaciones' + '<br>' +
    'El motivo del rechazo es <b>' + this.Observaciones + '</b><br>' +
    'Para ver sus actividades pendientes haga click <a href="http://localhost:4200/mis-pendientes">aquí</a>'

    let id = this.pendienteArr[0].ID
    let Estado = 'Rechazado';
    let ResponsableId = this.pendienteArr[0].Solicitante.ID;
    let ComentariosContador = this.Observaciones
    let obj = {
      Estado,
      ResponsableId,
      ComentariosContador
    }
    this.Servicio.ActualizarAnticipo(id, obj).then(
      (respuesta) => {
        this.envairNotificacion(cuerpo, this.pendienteArr[0].Solicitante.EMail);
        this.mostrarInformacion('El estado se actualizó correctamente.');
        sessionStorage.clear();
        this.router.navigate(['/home'])
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo actualizar el estado de la legalización. Intente más tarde');
        sessionStorage.clear();
        console.log(`rechazar ${err}`);
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 3000);
      }
    )
  }

  Aprobar() {
    this.spinner.show();
    let counter = 0
    this.validar(!this.Observaciones, 'Debe registrar las observaciones') && counter++;
    if(counter > 0) {
      this.spinner.hide();
      return false;
    }
    let cuerpo = '<p>Hola</p>' + '<br>' +
    'El usuario <b>' + this.pendienteArr[0].Responsable.Title + '</b> ha aprobado la legalización del anticipo ' + '<br>' +
    'Para ver sus actividades pendientes haga click <a href="http://localhost:4200/mis-pendientes">aquí</a>'
    let Estado = 'Aprobado';
    let ResponsableId = null;
    let Legalizado = true;
    let ComentariosContador = this.Observaciones;
    let id = this.pendienteArr[0].ID
    let obj = {
      Estado,
      ResponsableId,
      Legalizado,
      ComentariosContador
    }

    this.Servicio.ActualizarAnticipo(id, obj).then(
      (respuesta) => {
        this.envairNotificacion(cuerpo, this.pendienteArr[0].Solicitante.EMail);
        this.mostrarExitoso('La legalización se aprobó correctamente');
        sessionStorage.clear();
        this.router.navigate(['/home']);
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudó aprobar la legalización. Intente más tarde o contacte al administrador');
        this.spinner.hide();
        sessionStorage.clear();
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 3000);
      }
    )
  }
  
  async envairNotificacion(cuerpo, responsable) {
    let emailProps: IEmailProperties = {
      To: [responsable],
      Subject: 'Legalización de anticipos',
      Body: cuerpo,
    };
    await this.Servicio.EnviarCorreo(emailProps);
  }

  mostrarExitoso(mensaje: string) {
    this.toastr.success(mensaje, 'Confirmación!');
  };

  mostrarError(mensaje: string) {
    this.toastr.error(mensaje, 'Oops!');
  };

  mostrarAdvertencia(mensaje: string) {
    this.toastr.warning(mensaje, 'Validación');
  };

  mostrarInformacion(mensaje: string) {
    this.toastr.info(mensaje, 'Información importante');
  };

}

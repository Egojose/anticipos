import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiciosService } from '../servcios/servicios.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-editar-legalizacion',
  templateUrl: './editar-legalizacion.component.html',
  styleUrls: ['./editar-legalizacion.component.css']
})
export class EditarLegalizacionComponent implements OnInit {
  columnsDetalle: string[] = ['Tipo', 'Descripcion', 'Cantidad', 'Moneda', 'ValorTotal'];
  columnsLegalizacion: string[] = ['Tipo', 'Descripcion', 'Beneficiario', 'Moneda', 'ValorTotal', 'Origen', 'Destino', 'FechaInicio', 'FechaFin', 'Acciones']
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
  detalleItemsLegalizacion: { detalle: any[]; resumen: any[]; saldoAfavor: { Peso: string; Dolar: string; Euro: string; }; urlFacturas?: string, idDocumento?: number };
  arrayDetalleLegalizacion = [];
  urlDocumento: string;
  archivo: any;
  nombreArchivo: string;
  extensionArchivo: string;
  alertarExtension: boolean;
  biblioteca = 'DocumentosAnticipos';
  urlFacturas: string;
  idDocumento: number;
  Observaciones: string;
  empresa: string;
  tipoSolicitud: string;

  constructor(public router: Router, public Servicio: ServiciosService, public toastr: ToastrService, public spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    if(!sessionStorage.getItem('pendiente')) {
      this.router.navigate(['/']);
      return;
    }
    this.pendiente = JSON.parse(sessionStorage.getItem('pendiente'));
    // this.empresa = this.pendiente.usuario.Empresa;
    console.log(this.pendiente);
    this.pendienteArr.push(this.pendiente.pendiente);
    this.empresa = this.pendienteArr[0].Empresa;
    this.tipoSolicitud = this.pendienteArr[0].TipoSolicitud;
    console.log(this.pendienteArr);
    this.Observaciones = this.pendienteArr[0].ComentariosContador;
    this.detalleUnidades = JSON.parse(this.pendienteArr[0].Aprobadores).filter((x) => x.rol === 'Director unidad de negocio');
    this.detalleAnticipo = JSON.parse(this.pendiente.pendiente.DetalleAnticipo);
    let arrDetalle = JSON.parse(this.pendienteArr[0].DetalleLegalizacion);
    if(arrDetalle[0].urlFacturas) this.urlFacturas = arrDetalle[0].urlFacturas;
    if(arrDetalle[0].idDocumento) this.idDocumento = arrDetalle[0].idDocumento;
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
    this.detalleItemsLegalizacion = {
      detalle: this.detalleLegalizacion,
      resumen: this.resumenCuentas,
      saldoAfavor: {
        Peso: this.saldoPesosAfavor,
        Dolar: this.saldoDolarAfavor,
        Euro: this.saldoEurosAfavor
      }
    }
    this.totalPesos = this.SumarTotales(this.detalleAnticipo, 'Peso');
    this.totalDolares = this.SumarTotales(this.detalleAnticipo, 'Dolar');
    this.totalEuros = this.SumarTotales(this.detalleAnticipo, 'Euro');
    this.ConsultarContador();
    this.ObtenerTipoGasto();
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

  ObtenerTipoGasto() {
    this.Servicio.ConsultarTipoGasto().then(
      (respuesta) => {
        this.tipoGasto = respuesta.sort((a, b) => a.Title > b.Title? 1 : -1);
      }
    )
  }

  ConsultarContador() {
    this.Servicio.ConsultarAprobadores(this.empresa).then(
      (respuesta) => {
        this.contador = respuesta[0].Contador;
        console.log(this.contador)
      }
    )
  }

  mostrarCamposTransporte($event) {
    if($event === 'Transporte aéreo' || $event === 'Transporte terrestre'){
      this.camposTransporte = true
    }
    else {
      this.camposTransporte = false;
      this.origen = 'N/A';
      this.destino = 'N/A';
      this.fechaInicio = 'N/A';
      this.fechaFin = 'N/A'
    }
  }

  AsignarSaldoAfavor(saldo: number, saldoAfavor: string, empresa: string, solicitante: string) {
    if(saldo > 0) saldoAfavor = empresa;
    if(saldo < 0) saldoAfavor = solicitante;
    return saldoAfavor;
  }

  Validar(condicion: boolean, mensaje: string) {
    if(condicion) {
      this.mostrarAdvertencia(mensaje);
      return true;
    }
  }

  AgregarDetalle() {
    let counter = 0;
    this.Validar(!this.tipoDeGasto || this.tipoDeGasto === '', 'El tipo de gasto es requerido') && counter++;
    this.Validar(!this.beneficiario || this.beneficiario === '', 'El beneficiario es requerido') && counter++;
    this.Validar(!this.descripcion || this.descripcion === '', 'La descripción es requrida') && counter++;
    this.Validar(!this.valorTotal || this.valorTotal === '', 'El valor total es requerido') && counter++;
    this.Validar(!this.moneda || this.moneda === '', 'La moneda es requerida') && counter++;
    this.Validar((this.tipoDeGasto === 'Transporte aéreo' || this.tipoDeGasto === 'Transporte terrestre')
     && (!this.origen), 'El origen es requerido para transporte') && counter++;
    this.Validar((this.tipoDeGasto === 'Transporte aéreo' || this.tipoDeGasto === 'Transporte terrestre')
     && (!this.destino), 'El destino es requerido para transporte') && counter++;
    this.Validar((this.tipoDeGasto === 'Transporte aéreo' || this.tipoDeGasto === 'Transporte terrestre')
     && (!this.fechaInicio), 'La fecha de inicio es requerida para transporte') && counter++; 
    this.Validar((this.tipoDeGasto === 'Transporte aéreo' || this.tipoDeGasto === 'Transporte terrestre')
     && (!this.fechaFin), 'La fecha final es requerida para transporte') && counter++; 

    if(counter > 0) {
      return false;
    }

    let detalle = {
      tipo: this.tipoDeGasto,
      descripcion: this.descripcion,
      beneficiario: this.beneficiario,
      valorTotal: this.valorTotal,
      moneda: this.moneda,
      origen: this.origen,
      destino: this.destino,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    }
    this.detalleLegalizacion.push(detalle);
    this.detalle.data = this.detalleLegalizacion;
    let pesos = 0;
    let dolares = 0;
    let euros = 0;
    if(this.moneda === 'Peso') pesos = (+this.valorTotal);
    if(this.moneda === 'Dolar') dolares = (+this.valorTotal);
    if(this.moneda === 'Euro') euros = (+this.valorTotal);
   
    let gastos = {
      tipo: 'Gastos',
      concepto: detalle.tipo,
      Peso: pesos,
      Dolar: dolares,
      Euro: euros
    }
    let saldo = {
      tipo: 'Saldo',
      concepto: '****',
      Peso: (+this.totalPesos) - (this.SumarTotales(this.detalleLegalizacion, 'Peso')) ,
      Dolar: (+this.totalDolares) - (this.SumarTotales(this.detalleLegalizacion, 'Dolar')),
      Euro: (+this.totalEuros) - (this.SumarTotales(this.detalleLegalizacion, 'Euro'))
    }

    this.saldoPesosAfavor = this.AsignarSaldoAfavor(saldo.Peso, this.saldoPesosAfavor, this.pendienteArr[0].Empresa, this.pendienteArr[0].Solicitante.Title);
    this.saldoDolarAfavor = this.AsignarSaldoAfavor(saldo.Dolar, this.saldoDolarAfavor, this.pendienteArr[0].Empresa, this.pendienteArr[0].Solicitante.Title);
    this.saldoEurosAfavor = this.AsignarSaldoAfavor(saldo.Euro, this.saldoEurosAfavor, this.pendienteArr[0].Empresa, this.pendienteArr[0].Solicitante.Title)

    this.resumenCuentas.push(gastos);
    this.resumenCuentas.push(saldo);
    console.log(this.resumenCuentas);
    this.resumen.data = this.resumenCuentas;
    this.limpiarCampos();
    this.detalleItemsLegalizacion = {
      detalle: this.detalleLegalizacion,
      resumen: this.resumenCuentas,
      saldoAfavor: {
        Peso: this.saldoPesosAfavor,
        Dolar: this.saldoDolarAfavor,
        Euro: this.saldoEurosAfavor
      }
    }
  }

  limpiarCampos() {
    this.tipoDeGasto = '';
    this.descripcion = '';
    this.beneficiario = '';
    this.valorTotal = '',
    this.moneda = '';
    this.origen = '';
    this.destino = '';
    this.fechaInicio = '';
    this.fechaFin = '';
  }

  Eliminar(index: number) {
    console.log(index);
    let indexResumen: number;
    indexResumen = this.resumenCuentas.findIndex((x) => x.concepto === this.detalleLegalizacion[index].tipo)
    console.log(indexResumen);
    this.resumenCuentas.splice(indexResumen, 2);
    this.detalleLegalizacion.splice(index, 1),
    this.detalle.data = this.detalleLegalizacion;
    this.saldoPesosAfavor = '';
    this.saldoDolarAfavor = '';
    this.saldoEurosAfavor = ''
    for(let i = 1; i < this.resumenCuentas.length; i+=2) {
      this.resumenCuentas[i].Peso = (+this.totalPesos) - (this.SumarTotales(this.detalleLegalizacion, 'Peso'));
      this.resumenCuentas[i].Dolar = (+this.totalDolares) - (this.SumarTotales(this.detalleLegalizacion, 'Dolar'));
      this.resumenCuentas[i].Euro = (+this.totalEuros) - (this.SumarTotales(this.detalleLegalizacion, 'Euro'));
      this.saldoPesosAfavor = this.AsignarSaldoAfavor(this.resumenCuentas[i].Peso, this.saldoPesosAfavor, this.pendienteArr[0].Empresa, this.pendienteArr[0].Solicitante.Title);
      this.saldoDolarAfavor = this.AsignarSaldoAfavor(this.resumenCuentas[i].Dolar, this.saldoDolarAfavor, this.pendienteArr[0].Empresa, this.pendienteArr[0].Solicitante.Title);
      this.saldoEurosAfavor = this.AsignarSaldoAfavor(this.resumenCuentas[i].Euro, this.saldoEurosAfavor, this.pendienteArr[0].Empresa, this.pendienteArr[0].Solicitante.Title)
    }
  
    this.resumen.data = this.resumenCuentas;
    this.detalleItemsLegalizacion = {
      detalle: this.detalleLegalizacion,
      resumen: this.resumenCuentas,
      saldoAfavor: {
        Peso: this.saldoPesosAfavor,
        Dolar: this.saldoDolarAfavor,
        Euro: this.saldoEurosAfavor
      }
    }
  }

  AdjuntarSoporte($event) {
    console.log($event.target.files[0]);
    this.archivo = $event.target.files[0];
    this.nombreArchivo = $event.target.files[0].name;
    this.extensionArchivo = this.nombreArchivo.split('.')[1]
    this.validar(
      this.extensionArchivo !== 'pdf'
      && this.extensionArchivo !== 'doc'
      && this.extensionArchivo !== 'docx'
      && this.extensionArchivo !== 'eml' 
      && this.extensionArchivo !== 'jpg', 
      'El formato del archivo no es válido. Por favor revise'
      ) ? this.alertarExtension = true : this.alertarExtension = false;
      this.urlFacturas = undefined;
  }

  async GuardarArchivo() {
    await this.Servicio.AgregarDocumentos(this.biblioteca, this.GenerarIdentificador() + '--' + this.nombreArchivo, this.archivo).then(
      async f => {
        await f.file.getItem().then(item => {
          let urlRaiz = environment.urlRaiz
          this.urlDocumento = urlRaiz + f.data.ServerRelativeUrl;
          this.detalleItemsLegalizacion.urlFacturas = this.urlDocumento;
          this.detalleItemsLegalizacion.idDocumento = item.ID
          console.log(item)
        })
      }
    )
  }

  validar(condicion: boolean, mensaje: string) {
    if(condicion) {
      this.mostrarAdvertencia(mensaje);
      return true;
    }
  }

  GenerarIdentificador(): string {
    var fecha = new Date();
    var valorprimitivo = fecha.valueOf().toString();
    return valorprimitivo;
  }


  async GuardadoParcial() {
    if(this.archivo) {
      await this.GuardarArchivo();
    }
    if(!this.archivo && this.urlFacturas) {
      this.detalleItemsLegalizacion.urlFacturas = this.urlFacturas;
      this.detalleItemsLegalizacion.idDocumento = this.idDocumento;
    }
    this.arrayDetalleLegalizacion.push(this.detalleItemsLegalizacion);
    let id = this.pendienteArr[0].ID
    let obj = {
      DetalleLegalizacion: JSON.stringify(this.arrayDetalleLegalizacion),
      Estado: 'Guardado parcial'
    }
    this.Servicio.ActualizarAnticipo(id, obj).then(
      (respuesta) => {
        this.mostrarInformacion('Se guardó parcialmente la legalización. Puede seguirla editando más tarde.');
        this.router.navigate(['/'])
      }
    )
  }

  async Enviar() {
    this.spinner.show();
    let counter = 0;
    this.validar(this.detalleLegalizacion.length === 0, 'Revise el detalle  de legalización. Parece no contener datos') && counter++;
    this.validar(this.resumenCuentas.length === 0, 'Revise el resumen de las cuentas. Parece no contener datos') && counter++;
    this.validar((!this.archivo && !this.urlFacturas), 'Debe adjuntar el archivo con las facturas') && counter++;
    if(counter > 0) {
      this.spinner.hide();
      return false;
    }
    if(this.archivo){
      await this.GuardarArchivo();
    }
    else {
      this.detalleItemsLegalizacion.urlFacturas = this.urlFacturas;
      this.detalleItemsLegalizacion.idDocumento = this.idDocumento
    }
    this.arrayDetalleLegalizacion.push(this.detalleItemsLegalizacion);
    let ResponsableId = this.contador.ID;
    let id = this.pendienteArr[0].ID
    let obj = {
      DetalleLegalizacion: JSON.stringify(this.arrayDetalleLegalizacion),
      Estado: 'Por aprobar legalización',
      ResponsableId,
      UrlFacturas: this.urlFacturas
    }
    await this.Guardar(id, obj);
  }

  async Guardar(id, obj) {
    await this.Servicio.ActualizarAnticipo(id, obj).then(
      async (respuesta) => {
        await this.envairNotificacion();
        this.mostrarExitoso(`El ${this.tipoSolicitud} se actualizó correctamente`);
        sessionStorage.clear();
        this.spinner.hide();
        this.router.navigate(['/']);
      }
    ).catch(
      (err) => {
        this.mostrarError(`No se pudo actulizar el ${this.tipoSolicitud}. Por favor intente más tarde`);
        console.log(`error al guardar el anticipo ${err}`)
        sessionStorage.clear();
        setTimeout(() => {
          this.router.navigate(['/'])
        }, 3000);
      }
    )
  }

  async envairNotificacion() {
    let cuerpo = '<p>Hola</p>' + '<br>' +
    'El usuario <b>' + this.pendienteArr[0].Solicitante.Title + '</b> ha legalizado un '+this.tipoSolicitud+' el cual requiere de su aprobación' + '<br>' +
    'Para ver sus actividades pendientes haga click <a href="http://localhost:4200/mis-pendientes">aquí</a>'
    let emailProps: IEmailProperties = {
      To: [this.contador.EMail],
      Subject: 'Solicitud de anticipos',
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

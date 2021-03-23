import { Component, OnInit } from '@angular/core';
import { ServiciosService } from '../servcios/servicios.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-legalizar-anticipo',
  templateUrl: './legalizar-anticipo.component.html',
  styleUrls: ['./legalizar-anticipo.component.css']
})
export class LegalizarAnticipoComponent implements OnInit {
  columnsDetalle: string[] = ['Tipo', 'Descripcion', 'Cantidad', 'Moneda', 'ValorTotal'];
  columnsLegalizacion: string[] = ['Tipo', 'Descripcion', 'Beneficiario', 'Moneda', 'ValorTotal', 'Origen', 'Destino', 'FechaInicio', 'FechaFin', 'Acciones']
  displayedUnidades: string[] = ['Director', 'Ceco', 'Porcentaje'];
  displayedResumen: string[] = ['Detalle', 'Concepto', 'Pesos', 'Dolares', 'Euros'];
  pendiente;
  pendienteArr = [];
  detalleAnticipo;
  totalPesos: number;
  totalDolares: number;
  totalEuros: number;
  detalleUnidades = [];
  tipoGasto = [];
  camposTransporte: boolean;
  detalleLegalizacion = [];
  detalle = new MatTableDataSource(this.detalleLegalizacion);
  resumenCuentas = [];
  resumen = new MatTableDataSource(this.resumenCuentas)

  // variables campos
  tipoDeGasto: string;
  descripcion: string;
  beneficiario: string;
  valorTotal: string;
  moneda: string;
  origen: string;
  destino: string;
  fechaInicio;
  fechaFin;
  saldoPesosAfavor: string;
  saldoDolarAfavor: string;
  saldoEurosAfavor: string;
  detalleItemsLegalizacion: { detalle: any[]; resumen: any[]; saldoAfavor: { Peso: string; Dolar: string; Euro: string; }; urlFacturas?: string, idDocumento?: number };
  arrayDetalleLegalizacion = [];
  contador: any;
  extensionArchivo: string;
  archivo: any;
  nombreArchivo: string;
  alertarExtension: boolean;
  urlDocumento: string;
  biblioteca = 'DocumentosAnticipos'
  empresa: string;
  mostrarTexto: boolean;
  tipoSolicitud: string;
  declaracion: string;

 

  //*******

  

  constructor(public Servicio: ServiciosService, public router: Router, public toastr: ToastrService, public spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    if(!sessionStorage.getItem('pendiente')) {
      this.router.navigate(['/'])
    }
    this.pendiente = JSON.parse(sessionStorage.getItem('pendiente'));
    // this.empresa = this.pendiente.usuario.Empresa
    console.log(this.pendiente);
    this.pendienteArr.push(this.pendiente.pendiente);
    this.empresa = this.pendienteArr[0].Empresa
    this.tipoSolicitud = this.pendienteArr[0].TipoSolicitud;
    console.log(this.pendienteArr);
    this.detalleAnticipo = JSON.parse(this.pendiente.pendiente.DetalleAnticipo);
    this.detalleUnidades = JSON.parse(this.pendienteArr[0].Aprobadores).filter((x) => x.rol === 'Director unidad de negocio');
    console.log(this.pendienteArr);
    this.totalPesos = this.SumarTotales(this.detalleAnticipo, 'Peso');
    this.totalDolares = this.SumarTotales(this.detalleAnticipo, 'Dolar');
    this.totalEuros = this.SumarTotales(this.detalleAnticipo, 'Euro');

    

    this.ObtenerTipoGasto();
    this.ConsultarContador();
    this.consultarDeclaracion();
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

  consultarDeclaracion() {
    this.Servicio.ConsultarConsecutivo().then(
      (respuesta) => {
        this.declaracion = respuesta[0].TextoNoContraprestacion
      }
    )
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
  }

  async GuardarArchivo() {
    await this.Servicio.AgregarDocumentos(this.biblioteca, this.GenerarIdentificador() + '--' + this.nombreArchivo, this.archivo).then(
      async f => {
        await f.file.getItem().then(item => {
          console.log(item)
          let urlRaiz = environment.urlRaiz
          this.urlDocumento = urlRaiz + f.data.ServerRelativeUrl;
          this.detalleItemsLegalizacion.urlFacturas = this.urlDocumento
          this.detalleItemsLegalizacion.idDocumento = item.ID
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
  
  disclaimer($event: boolean) {
    this.mostrarTexto = $event 
  }


  async GuardadoParcial() {
    if(this.archivo) {
      await this.GuardarArchivo();
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
    this.validar(!this.archivo, 'Debe adjuntar el archivo con las facturas') && counter++;
    this.validar(!this.mostrarTexto, 'Debe hacer la declaración de no contraprestación de servicio') && counter++;
    if(counter > 0) {
      this.spinner.hide();
      return false;
    }
    await this.GuardarArchivo();
    this.arrayDetalleLegalizacion.push(this.detalleItemsLegalizacion);
    let ResponsableId = this.contador.ID;
    let id = this.pendienteArr[0].ID;
    let DeclaracionNoConstituyeSalario = this.declaracion;
    let obj = {
      DetalleLegalizacion: JSON.stringify(this.arrayDetalleLegalizacion),
      Estado: 'Por aprobar legalización',
      ResponsableId,
      UrlFacturas: this.urlDocumento,
      DeclaracionNoConstituyeSalario,
    }
    await this.Guardar(id, obj);
  }

  async Guardar(id: number, obj: Object) {
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
        this.mostrarError(`No se pudo actualizar el ${this.tipoSolicitud}. Por favor intente más tarde`);
        console.log(`error al guardar el anticipo ${err}`);
        sessionStorage.clear();
        this.spinner.hide();
        this.router.navigate(['/'])
      }
    )
  }

  async envairNotificacion() {
    let cuerpo = '<p>Hola</p>' + '<br>' +
    'El usuario <b>' + this.pendienteArr[0].Solicitante.Title + '</b> ha legalizado un '+this.tipoSolicitud+' el cual requiere de su aprobación' + '<br>' +
    'Para ver sus actividades pendientes haga click <a href="https://aribasas.sharepoint.com/sites/apps/SiteAssets/aplicacionesPruebas/Anticipos/index.aspx/mis-pendientes">aquí</a>'
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

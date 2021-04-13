import { Component, OnInit } from '@angular/core';
import { ServiciosService } from '../servcios/servicios.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router'
import { IEmailProperties } from '@pnp/sp/sputilities';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-aprobar-anticipo',
  templateUrl: './aprobar-anticipo.component.html',
  styleUrls: ['./aprobar-anticipo.component.css']
})
export class AprobarAnticipoComponent implements OnInit {
  displayedColumns: string[] = ['TipoGasto', 'Descripcion', 'Cantidad', 'Moneda', 'ValorUnitario', 'ValorTotal'];
  displayedUnidades: string[] = ['Director', 'Ceco', 'Porcentaje'];
  columnsAprobadores: string[] = ['Nombre', 'Firma', 'Rol'];
  pendiente;
  pendienteArr = [];
  detalleAnticipo;
  detalleUnidades = [];
  aprobadores = [];
  dataAprobadores = new MatTableDataSource(this.aprobadores)
  totalPesos: number;
  totalDolares: number;
  totalEuros: number;
  ocultarBtnAprobar = false;
  fecha = new Date();
  usuario;
  gerente;
  ocultarBtn: boolean;
  gerenteObj: object;
  responsable;
  tesorero: any;
  index: number;
  mostrarBtn = true;
  empresa: string;
  firmaGerente: any;
  FormaPago;
  tipoSolicitud: string;
  detalleCierre: boolean;
  Entidad: string;
  numeroTransaccion:string;
  solicitante: string;
  fechaEntrega: string;
  Comentarios: string;
  arrDetalleCierre = [];
  urlSoporte: string;


  constructor(public Servicio: ServiciosService, public spinner: NgxSpinnerService, public toastr: ToastrService, public router: Router) { }

  async ngOnInit() {
    if(!sessionStorage.getItem('pendiente')) {
      this.router.navigate(['/']);
      return;
    }
    this.pendiente = JSON.parse(sessionStorage.getItem('pendiente'));
    this.pendienteArr.push(this.pendiente.pendiente);
    this.usuario = this.pendiente.usuario;
    this.empresa = this.pendienteArr[0].Empresa;
    this.tipoSolicitud = this.pendienteArr[0].TipoSolicitud
    this.arrDetalleCierre.push(JSON.parse(this.pendienteArr[0].DetalleCierre));
    this.pendienteArr[0].detalleAnticipo


    console.log(this.arrDetalleCierre[0]);
    if (this.arrDetalleCierre[0] !== null) {
      this.Entidad = this.arrDetalleCierre[0].entidad ? this.arrDetalleCierre[0].entidad : '';
      this.numeroTransaccion = this.arrDetalleCierre[0].numero_transaccion ? this.arrDetalleCierre[0].numero_transaccion : '';
      this.solicitante = this.arrDetalleCierre[0].solicitante ? this.arrDetalleCierre[0].solicitante : '';
      this.fechaEntrega = this.arrDetalleCierre[0].fecha_entrega ? this.arrDetalleCierre[0].fecha_entrega : null;
      this.urlSoporte = this.arrDetalleCierre[0].url_documento ? this.arrDetalleCierre[0].url_documento : '';
      this.Comentarios = this.arrDetalleCierre[0].comentarios ? this.arrDetalleCierre[0].comentarios : '';
    }
    console.log(this.empresa);
    // this.empresa = this.usuario.Empresa;
    console.log(this.empresa);
    if(this.pendienteArr[0].DetalleCierre && this.pendienteArr[0].DetalleCierre.length > 0) this.detalleCierre = true;
    if(this.pendiente.query) this.mostrarBtn = false;
    // this.pendiente.gerente ? this.gerente = this.pendiente.gerente : this.gerente = [];
    this.detalleAnticipo = JSON.parse(this.pendiente.pendiente.DetalleAnticipo);
    this.aprobadores = JSON.parse(this.pendienteArr[0].Aprobadores);
    this.dataAprobadores.data = this.aprobadores;
    this.detalleUnidades = this.aprobadores.filter((x) => x.rol === 'Director unidad de negocio');
    this.totalPesos = this.SumarTotales(this.detalleAnticipo, 'Peso');
    this.totalDolares = this.SumarTotales(this.detalleAnticipo, 'Dolar');
    this.totalEuros = this.SumarTotales(this.detalleAnticipo, 'Euro');
    
    
    this.ConsultarTesorero();
    await this.ObtenerAprobadores(this.empresa)
  }

  async ObtenerAprobadores(empresa: string) {
    await this.Servicio.ConsultarAprobadores(empresa).then(
      async (respuesta) => {
        console.log(respuesta);
        await this.ObtenerFirmaGerente(respuesta[0].GerenteAdministrativo.ID);
        this.gerente = {
          Title: respuesta[0].GerenteAdministrativo.Title,
          ID: respuesta[0].GerenteAdministrativo.ID,
          EMail: respuesta[0].GerenteAdministrativo.EMail,
          // Firma: this.firmaGerente,
        };
        this.gerenteObj = {
          Director: this.gerente,
          aprobado: false,
          fecha: '',
          rol: 'Gerente administrativo y financiero',
        };
        this.pendienteArr[0].Estado === 'Por aprobar gerente administrativo' && this.aprobadores.push(this.gerenteObj);
        console.log(this.gerente);
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo cargar el aprobador');
        console.error(`Aprobador ${err}`);
        this.spinner.hide();
      }
    )
  }

  async ObtenerFirmaGerente(id: number) {
    await this.Servicio.ConsultarUsuarioEmpleados(id).then(
      (respuesta) => {
        if(respuesta[0].UrlFirma) this.firmaGerente = respuesta[0].UrlFirma.Url;
        console.log(this.firmaGerente);
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo cargar la información del gerente');
        console.log(`Firma gerente ${err}`);
        this.spinner.hide();
      }
    )
  }

  ConsultarTesorero() {
    this.Servicio.ConsultarAprobadores(this.empresa).then(
      (respuesta) => {
        this.tesorero = respuesta[0].Tesorero;
        console.log(this.tesorero)
      }
    )
  }

  formatearFecha(date: Date) {
    let date1: string;
    date.getDate() < 10 ? date1 = `0${date.getDate()}` : date1 = date.getDate().toString();
    let date2: string;
    (date.getMonth() + 1) < 10 ? date2 = `0${(date.getMonth() + 1)}` : date2 = (date.getMonth() + 1).toString();
    let date3 = date.getFullYear().toString();
    return `${date1}/${date2}/${date3}`
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
    this.ocultarBtn = true;
    console.log(this.aprobadores[0]);
    console.log(this.usuario);
    console.log(this.gerente);
    this.index = this.aprobadores.findIndex((x) => x.aprobado === false);
    console.log(this.index);
    this.aprobadores[this.index].aprobado =  true;
    this.aprobadores[this.index].fecha = this.formatearFecha(new Date())
    this.aprobadores[this.index].Director.Firma = this.usuario.Firma;
    this.dataAprobadores.data = this.aprobadores;
    this.responsable = this.aprobadores[this.index].Director;
    this.mostrarInformacion('Haga click en enviar para finalizar el proceso')
  }

  async ActualizarSolicitud() {
    this.spinner.show();
    let porAprobar = this.aprobadores.filter((x) => x.rol === 'Director unidad de negocio' && x.aprobado === false);
    let Aprobadores = JSON.stringify(this.aprobadores)
    let id = this.pendienteArr[0].Id;
    let ResponsableId; 
    let obj;
    let cuerpo;
    let emailResponsable: string;

    if(this.pendienteArr[0].Estado === 'Por aprobar gerente administrativo'){
      this.responsable = this.tesorero
      cuerpo = '<p>Hola</p>' + '<br>' +
      'Al usuario <b>' + this.pendienteArr[0].Solicitante.Title + '</b> se le ha aprobado un '+this.tipoSolicitud+' el cual requiere de su intervención' + '<br>' +
      'Para ver sus actividades pendientes haga click <a href="http://localhost:4200/mis-pendientes">aquí</a>'
      emailResponsable = this.tesorero.EMail
      obj = {
        Aprobadores,
        Estado: 'Por desembolsar',
        ResponsableId: this.tesorero.ID,
        FechaAprobacion: new Date()
      }
    } 
    if(porAprobar.length > 0 && this.pendienteArr[0].Estado === 'Por aprobar') {
      this.responsable = porAprobar[0].Director;
      cuerpo = '<p>Hola</p>' + '<br>' +
      'El usuario <b>' + this.pendienteArr[0].Solicitante.Title + '</b> ha solicitado un '+this.tipoSolicitud+' el cual requiere de su aprobación' + '<br>' +
      'Para ver sus actividades pendientes haga click <a href="http://localhost:4200/mis-pendientes">aquí</a>'
      emailResponsable = this.responsable.EMail
      obj = {
        Aprobadores,
        ResponsableId: this.responsable.ID
      }
    }  
    if(porAprobar.length === 0 && this.pendienteArr[0].Estado === 'Por aprobar') {
      this.responsable = this.gerente;
      cuerpo = '<p>Hola</p>' + '<br>' +
      'El usuario <b>' + this.pendienteArr[0].Solicitante.Title + '</b> ha solicitado un '+this.tipoSolicitud+' el cual requiere de su aprobación' + '<br>' +
      'Para ver sus actividades pendientes haga click <a href="http://localhost:4200/mis-pendientes">aquí</a>'
      emailResponsable = this.responsable.EMail
      obj = {
        Aprobadores,
        Estado: 'Por aprobar gerente administrativo',
        ResponsableId: this.responsable.ID
      }
    }
    await this.Servicio.ActualizarAnticipo(id, obj).then(
      async (respuesta) => {
        this.mostrarExitoso('La solicitud se aprobó correctamente');
        await this.envairNotificacion(cuerpo, emailResponsable);
        sessionStorage.clear();
        this.spinner.hide();
        this.router.navigate(['/']);
      }
    ).catch(
      (err) => {
        this.spinner.hide();
        this.mostrarError('No se pudo actualizar el estado del anticipo. Por favor intente más tarde');
        this.router.navigate(['/']);
      }
    )
  };

  async envairNotificacion(cuerpo, responsable) {
    
    let emailProps: IEmailProperties = {
      To: [responsable],
      Subject: 'Solicitud de anticipos',
      Body: cuerpo,
    };

    await this.Servicio.EnviarCorreo(emailProps);
  }

  cancelar() {
    this.router.navigate(['/'])
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

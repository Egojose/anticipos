import { Component, OnInit } from '@angular/core';
import { ServiciosService } from '../servcios/servicios.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router'
import { IEmailProperties } from '@pnp/sp/sputilities';

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

  constructor(public Servicio: ServiciosService, public spinner: NgxSpinnerService, public toastr: ToastrService, public router: Router) { }

  ngOnInit(): void {
    if(!sessionStorage.getItem('pendiente')) {
      this.router.navigate(['/']);
      return;
    }
    this.pendiente = JSON.parse(sessionStorage.getItem('pendiente'));
    this.empresa = this.pendiente.usuario.Empresa;
    this.pendienteArr.push(this.pendiente.pendiente);
    this.usuario = this.pendiente.usuario;
    if(this.pendiente.query) this.mostrarBtn = false;
    this.pendiente.gerente ? this.gerente = this.pendiente.gerente : this.gerente = [];
    this.detalleAnticipo = JSON.parse(this.pendiente.pendiente.DetalleAnticipo);
    this.aprobadores = JSON.parse(this.pendienteArr[0].Aprobadores);
    this.detalleUnidades = this.aprobadores.filter((x) => x.rol === 'Director unidad de negocio');
    this.totalPesos = this.SumarTotales(this.detalleAnticipo, 'Peso');
    this.totalDolares = this.SumarTotales(this.detalleAnticipo, 'Dolar');
    this.totalEuros = this.SumarTotales(this.detalleAnticipo, 'Euro');
    this.gerenteObj = {
      Director: this.gerente[0],
      aprobado: false,
      fecha: '',
      rol: 'Gerente administrativo y financiero',
    };
    this.pendienteArr[0].Estado === 'Por aprobar gerente administrativo' && this.aprobadores.push(this.gerenteObj);
    this.ConsultarTesorero();
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
      'Al usuario <b>' + this.pendienteArr[0].Solicitante.Title + '</b> se le ha aprobado un anticipo el cual requiere de su intervención' + '<br>' +
      'Para ver sus actividades pendientes haga click <a href="https://aribasas.sharepoint.com/sites/apps/SiteAssets/aplicacionesPruebas/Anticipos/index.aspx/mis-pendientes">aquí</a>'
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
      'El usuario <b>' + this.pendienteArr[0].Solicitante.Title + '</b> ha solicitado un anticipo el cual requiere de su aprobación' + '<br>' +
      'Para ver sus actividades pendientes haga click <a href="https://aribasas.sharepoint.com/sites/apps/SiteAssets/aplicacionesPruebas/Anticipos/index.aspx/mis-pendientes">aquí</a>'
      emailResponsable = this.responsable.EMail
      obj = {
        Aprobadores,
        ResponsableId: this.responsable.ID
      }
    }  
    if(porAprobar.length === 0 && this.pendienteArr[0].Estado === 'Por aprobar') {
      this.responsable = this.gerente[0];
      cuerpo = '<p>Hola</p>' + '<br>' +
      'El usuario <b>' + this.pendienteArr[0].Solicitante.Title + '</b> ha solicitado un anticipo el cual requiere de su aprobación' + '<br>' +
      'Para ver sus actividades pendientes haga click <a href="https://aribasas.sharepoint.com/sites/apps/SiteAssets/aplicacionesPruebas/Anticipos/index.aspx/mis-pendientes">aquí</a>'
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

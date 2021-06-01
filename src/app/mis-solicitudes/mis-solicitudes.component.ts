import { Component, OnInit, TemplateRef  } from '@angular/core';
import { Router } from '@angular/router';
import { ServiciosService } from '../servcios/servicios.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { IEmailProperties } from '@pnp/sp/sputilities';

@Component({
  selector: 'app-mis-solicitudes',
  templateUrl: './mis-solicitudes.component.html',
  styleUrls: ['./mis-solicitudes.component.css']
})
export class MisSolicitudesComponent implements OnInit {
  displayedColumns = ['Titulo', 'Descripcion', 'Solicitante', 'Estado', 'Acciones'];
  anticipos = [];
  pendientes;
  idUsuario: number;
  modalRef: BsModalRef;
  modalTitulo: string;
  textoInfo: string;
  solicitud: any;
  tipo: string;
  emailResponsable: string;
  cuerpo: string;
  consecutivo: any;
  constructor(public router: Router, public Servicios: ServiciosService, private modalService: BsModalService, public toastr: ToastrService) { }

  async ngOnInit() {
    if(!sessionStorage.getItem('datosUsuario')) {
      this.router.navigate(['/']);
      return;
    }
    this.pendientes = JSON.parse(sessionStorage.getItem('datosUsuario'))
    this.idUsuario = this.pendientes.usuario.Id
    await this.ConsultarAnticiposNoLegalizados()
  }

  async ConsultarAnticiposNoLegalizados() {
    await this.Servicios.ConsultarTodosAnticiposXusuraio(this.idUsuario).then(
      (respuesta) => {
        this.anticipos = respuesta;
      }
    ).catch(
      (err) => console.log(err)
    )
  };

  openModal(template: TemplateRef<any>, tipo: string, elemento) {
    this.solicitud = elemento;
    this.emailResponsable = this.solicitud.Responsable.EMail;
    this.consecutivo = this.solicitud.Consecutivo
    this.tipo = tipo;
    if(this.tipo === 'Pausar') {
      this.modalTitulo = 'Pausar solicitud';
      this.textoInfo = 'Está a punto de pausar esta solicitud. Podrá reactivarla en cualquier momento'
    }
    else if(this.tipo === 'Reactivar') {
      this.modalTitulo = 'Reactivar solicitud';
      this.textoInfo = 'Está a punto de Reactivar esta solicitud. Una vez reactivada seguirá su curso normal'
    }
    else {
      this.modalTitulo = 'Cancelar solicitud';
      this.textoInfo = 'Está a punto de cancelar esta solicitud. Una vez cancelada se descartará'
    }
    this.modalRef = this.modalService.show(template);
  }

  async Reactivar() {
    this.cuerpo = '<p>Hola</p>' + '<br>' +
    'El usuario <b>' + this.anticipos[0].Solicitante.Title + '</b> ha Reactivado el anticipo' + this.consecutivo + ' el cual requiere de su intervención' + '<br>' +
    'Para ver sus actividades pendientes haga click <a href="https://aribasas.sharepoint.com/sites/apps/SiteAssets/aplicacionesPruebas/Anticipos/index.aspx/mis-pendientes">aquí</a>'
    let elements = JSON.parse(this.solicitud.EstadoActual);
    let idResponsable = elements.responsable;
    let estado = elements.estado;
    let id = this.solicitud.Id;
    let pausado = false;
    let cancelado = false;
    let estadoActual = '';
    await this.ActualizarSolicitud(id, estado, idResponsable, estadoActual, pausado, cancelado);
    this.modalRef.hide();
    this.router.navigate(['/'])
  }

  async Pausar() {
    this.cuerpo = '<p>Hola</p>' + '<br>' +
    'El usuario <b>' + this.anticipos[0].Solicitante.Title + '</b> ha pausado el anticipo' + this.consecutivo + ' una vez que se reactive se le notificará' + '<br>' +
    'Para ver sus actividades pendientes haga click <a href="https://aribasas.sharepoint.com/sites/apps/SiteAssets/aplicacionesPruebas/Anticipos/index.aspx/mis-pendientes">aquí</a>'
    let estado = 'Pausado';
    let id = this.solicitud.Id;
    let idResponsable = this.idUsuario;
    let pausado = true;
    let cancelado = false;
    let estadoActual = {
      estado: this.solicitud.Estado,
      responsable: this.solicitud.ResponsableId,
      email: this.emailResponsable
    }
    await this.ActualizarSolicitud(id, estado, idResponsable, JSON.stringify(estadoActual, null, 2), pausado, cancelado);
    this.modalRef.hide();
    this.router.navigate(['/'])
  }

  async Cancelar() {
    this.cuerpo = '<p>Hola</p>' + '<br>' +
    'El usuario <b>' + this.anticipos[0].Solicitante.Title + '</b> ha cancelado el anticipo' + this.consecutivo + ' el cual ya no requiere de su intervención' + '<br>' +
    'Para ver sus actividades pendientes haga click <a href="https://aribasas.sharepoint.com/sites/apps/SiteAssets/aplicacionesPruebas/Anticipos/index.aspx/mis-pendientes">aquí</a>'
    let estado = 'Cancelado';
    let id = this.solicitud.Id;
    let idResponsable = null;
    let estadoActual = ''
    let pausado = false;
    let cancelado = true
    await this.ActualizarSolicitud(id, estado, idResponsable, estadoActual, pausado, cancelado);
    this.modalRef.hide();
    this.router.navigate(['/'])
  }

  Salir() {
    this.modalRef.hide();
  }

  async ActualizarSolicitud(
    id: number,
    estado: string, 
    idResponsable: number, 
    estadoActual: string, 
    pausado: boolean,
    cancelado: boolean
    ) {
    let obj = {
      Estado: estado,
      ResponsableId: idResponsable,
      EstadoActual: estadoActual,
      Pausado: pausado,
      Cancelado: cancelado
    }
    await this.Servicios.ActualizarAnticipo(id, obj).then(
      async (respuesta) => {
        await this.envairNotificacion(this.emailResponsable, this.cuerpo);
        this.mostrarExitoso('El estado de la solicitud se actualizó correctamente')
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo actualizar el estado de la solicitud');
        console.log('Error al actualizar el estado' + err);
      }
    )
  }

  async envairNotificacion(email: string, cuerpo: string) {
    let emailProps: IEmailProperties = {
      To: [email],
      Subject: 'Solicitud de anticipos',
      Body: cuerpo,
    };

    await this.Servicios.EnviarCorreo(emailProps);
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

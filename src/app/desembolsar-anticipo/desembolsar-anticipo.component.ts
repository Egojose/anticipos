import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiciosService } from '../servcios/servicios.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-desembolsar-anticipo',
  templateUrl: './desembolsar-anticipo.component.html',
  styleUrls: ['./desembolsar-anticipo.component.css']
})
export class DesembolsarAnticipoComponent implements OnInit {
  pendiente;
  anticipo = [];
  totalPesos: number;
  totalDolares: number;
  totalEuros: number;
  detalleAnticipo = [];
  solicitante;
  biblioteca = 'DocumentosAnticipos'
  archivo: any;
  nombreArchivo: any;
  urlDocumento: string;
  fechaEntrega;
  numeroTransaccion: string;
  Entidad: string;
  FormaPago;
  Comentarios: string;
  detalleDesembolso = [];
  extensionArchivo: any;
  alertarExtension: boolean;
  tipoSolicitud: string; 

  constructor(public router: Router, public Servicio: ServiciosService, public toastr: ToastrService, public spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    if(!sessionStorage.getItem('pendiente')) {
      this.router.navigate(['/']);
      return;
    }
    this.pendiente = JSON.parse(sessionStorage.getItem('pendiente'));
    this.anticipo.push(this.pendiente.pendiente);
    this.detalleAnticipo = JSON.parse(this.anticipo[0].DetalleAnticipo)
    this.tipoSolicitud = this.anticipo[0].TipoSolicitud;
    this.totalPesos = this.SumarTotales(this.detalleAnticipo, 'Peso');
    this.totalDolares = this.SumarTotales(this.detalleAnticipo, 'Dolar');
    this.totalEuros = this.SumarTotales(this.detalleAnticipo, 'Euro');
    this.solicitante = this.anticipo[0].Solicitante.Title
  }

  SumarTotales(arr, moneda: string) {
    let suma = 0;
    let filterArr;
    filterArr = arr.filter((x) => {
      return x.moneda === moneda
    })
    for (let i = 0; i < filterArr.length; i++) {
      let valor = filterArr[i].valorTotal
      suma = suma + valor
    }
    return suma;
  }

  formatearFecha(date: Date) {
    let date1: string;
    date.getDate() < 10 ? date1 = `0${date.getDate()}` : date1 = date.getDate().toString();
    let date2: string;
    (date.getMonth() + 1) < 10 ? date2 = `0${(date.getMonth() + 1)}` : date2 = (date.getMonth() + 1).toString();
    let date3 = date.getFullYear().toString();
    return `${date1}/${date2}/${date3}`
  }

  GenerarIdentificador(): string {
    var fecha = new Date();
    var valorprimitivo = fecha.valueOf().toString();
    return valorprimitivo;
  }


  AdjuntarSoporte($event) {
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
          let urlRaiz = environment.urlRaiz
          this.urlDocumento = urlRaiz + f.data.ServerRelativeUrl;
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

  async AgregarDetalle() {
    this.spinner.show();
    let counter = 0
    this.validar(!this.FormaPago || this.FormaPago === '', 'La forma de pago es obligatoria') && counter++;
    this.validar(!this.Entidad || this.Entidad === '', 'La entidad es obligatoria') && counter++;
    this.validar(!this.numeroTransaccion || this.numeroTransaccion === '', 'El número de transacción es obligatorio') && counter++;
    this.validar(!this.fechaEntrega || this.fechaEntrega === '', 'La fecha de entrega es obligatoria') && counter++;
    this.validar(!this.Comentarios || this.Comentarios === '', 'Debe ampliar la información en los comentarios') && counter++;
    this.validar(!this.archivo || this.archivo === '', 'El soporte es obligatorio') && counter++;
    this.validar(
      this.extensionArchivo !== 'pdf'
      && this.extensionArchivo !== 'doc'
      && this.extensionArchivo !== 'docx'
      && this.extensionArchivo !== 'eml' 
      && this.extensionArchivo !== 'jpg', 
      'El formato del archivo no es válido. Por favor revise') && counter++;

    if(counter > 0) {
      this.spinner.hide();
      return false;
    }
    await this.GuardarArchivo();
    let idAnticipo = this.anticipo[0].ID
    let detalle = {
      formaPago: this.FormaPago,
      entidad: this.Entidad,
      numeroTransaccion: this.numeroTransaccion,
      solicitante: this.solicitante,
      fechaEntrega: this.fechaEntrega,
      urlSoporte: this.urlDocumento,
      comentarios: this.Comentarios
    }
    this.detalleDesembolso.push(detalle);
    let obj = {
      DetalleDesembolso: JSON.stringify(this.detalleDesembolso),
      ResponsableId: this.anticipo[0].Solicitante.ID,
      Estado: 'Por legalizar'
    }
    await this.ActualizarAnticipo(idAnticipo, obj)
  }

  async ActualizarAnticipo(id: number, obj: object) {
    await this.Servicio.ActualizarAnticipo(id, obj).then(
      async (respuesta) => {
        this.mostrarExitoso('El estado del anticipo se actualizó correctamente');
        await this.envairNotificacion();
        this.spinner.hide();
        this.router.navigate(['/']);
      }
    ).catch(
      (err) => {
        this.spinner.hide();
        console.log(`No se puede actualizar el anticipo  ${err}`);
        this.mostrarError('No se pudo actualizar el estado del anticipo. Por favor intente más tarde');
        this.router.navigate(['/']);
      }
    )
  }

  async envairNotificacion() {
    let cuerpo = '<p>Hola</p>' + '<br>' +
    '<p>Se ha hecho el desembolso del '+this.tipoSolicitud+' que solicitó.</p>' + '<br>' +
    '<p>Por favor recuerde que tiene 5 días hábilies después del ' + this.formatearFecha(new Date(this.anticipo[0].FechaFinalizacion)) + ' para hacer la legalización.</p>' + '<br>' +
    'Para ver sus actividades pendientes haga click <a href="https://aribasas.sharepoint.com/sites/apps/SiteAssets/aplicacionesPruebas/Anticipos/index.aspx/mis-pendientes">aquí</a>'

    let emailProps: IEmailProperties = {
      To: [this.anticipo[0].Solicitante.EMail],
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

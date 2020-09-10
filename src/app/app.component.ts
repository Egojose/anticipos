import { Component, OnInit } from '@angular/core';
import { ServiciosService } from './servcios/servicios.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'anticipos-araujo';
  usuarioActual;
  pendientes = [];

  constructor(public Servicios: ServiciosService, public spinner: NgxSpinnerService, public toastr: ToastrService) {}

  ngOnInit() {
    this.ObtenerUsuarioActual();
  };

  ObtenerUsuarioActual() {
    this.spinner.show();
    this.Servicios.ObtenerUsuarioActual().then(
      async (respuesta) => {
        this.usuarioActual = respuesta;
        console.log(this.usuarioActual);
        await this.ObtnenerAnticiposPendientes()
        this.spinner.hide();
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo cargar el usuario actual. Por favor intente hacer su solicitud más tarde');
        console.log('error cargando usuario' + err);
        this.spinner.hide();
      }
    )
  };

  async ObtnenerAnticiposPendientes() {
    await this.Servicios.ConsultarPendientes(this.usuarioActual.Id).then(
      (respuesta) => {
        this.pendientes = respuesta;
        console.log(this.pendientes)
      }
    )
  };

  enviarDatos() {
    let datos = {
      usuario: {
        Id: this.usuarioActual.Id,
        Title: this.usuarioActual.Title,
        Email: this.usuarioActual.Email
      },
      pendientes: this.pendientes
    }
    sessionStorage.setItem('datosUsuario', JSON.stringify(datos))
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

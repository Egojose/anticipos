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
  firma;
  firmaGerente;
  gerenteAdmin;
  errores = 0

  constructor(public Servicios: ServiciosService, public spinner: NgxSpinnerService, public toastr: ToastrService) {}

  ngOnInit() {
    sessionStorage.clear();
    this.ObtenerUsuarioActual();
    this.ObtenerAprobadores();
  };

  ObtenerUsuarioActual() {
    this.spinner.show();
    this.Servicios.ObtenerUsuarioActual().then(
      async (respuesta) => {
        this.usuarioActual = respuesta;
        console.log(this.usuarioActual);
        await this.ObtnenerAnticiposPendientes();
        await this.ObtenerEmpleado(this.usuarioActual.Id);
        this.spinner.hide();
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo cargar el usuario actual. Por favor intente hacer su solicitud más tarde');
        console.log('error cargando usuario' + err);
        this.errores++
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
    ).catch(
      (err) => {
        this.mostrarError('No se pudieron cargar los anticipos pendientes');
        console.error(`Pendientes ${err}`);
        this.errores++
        this.spinner.hide();
      }
    )
  };

  async ObtenerEmpleado(id: number) {
    await this.Servicios.ConsultarUsuarioEmpleados(id).then(
      (respuesta) => {
        if(respuesta[0].UrlFirma) this.firma = respuesta[0].UrlFirma.Url;
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo cargar la información del empleado');
        console.error(`Empleado ${err}`);
        this.errores++
        this.spinner.hide();
      }
    )
  }

  async ObtenerAprobadores() {
    await this.Servicios.ConsultarAprobadores().then(
      async (respuesta) => {
        await this.ObtenerFirmaGerente(respuesta[0].GerenteAdministrativo.ID);
        this.gerenteAdmin = {
          Title: respuesta[0].GerenteAdministrativo.Title,
          ID: respuesta[0].GerenteAdministrativo.ID,
          EMail: respuesta[0].GerenteAdministrativo.EMail,
          // Firma: this.firmaGerente,
        }
        console.log(this.gerenteAdmin);
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo cargar el aprobador');
        console.error(`Aprobador ${err}`);
        this.errores++
        this.spinner.hide();
      }
    )
  }

  async ObtenerFirmaGerente(id: number) {
    await this.Servicios.ConsultarUsuarioEmpleados(id).then(
      (respuesta) => {
        if(respuesta[0].UrlFirma) this.firmaGerente = respuesta[0].UrlFirma.Url;
        console.log(this.firmaGerente);
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo cargar la información del gerente');
        console.log(`Firma gerente ${err}`);
        this.errores++
        this.spinner.hide();
      }
    )
  }

  enviarDatos() {
    if(this.errores > 0) {
      this.mostrarAdvertencia('La solicitud no se pude procesar debido a que algunos elementos no se cargaron correctamente. Contacte al administrador');
      return false
    }
    let datos = {
      pendientes: this.pendientes,
      gerente: this.gerenteAdmin,
      usuario: {
        Id: this.usuarioActual.Id,
        Title: this.usuarioActual.Title,
        EMail: this.usuarioActual.Email,
        Firma: this.firma
      }
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

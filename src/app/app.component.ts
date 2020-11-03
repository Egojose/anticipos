import { Component, OnInit } from '@angular/core';
import { ServiciosService } from './servcios/servicios.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';
import $ from "jquery";


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
  bloquearSolicitud: boolean;
  empresa: string;
  anticiposSinLegalizar = [];
  nombreUsuario: string;
  status = true;

  constructor(public Servicios: ServiciosService, public spinner: NgxSpinnerService, public toastr: ToastrService) {}

  ngOnInit() {
    sessionStorage.clear();
    $(function(){
      $(".btn-toggle-menu").click(function() {
          $("#wrapper").toggleClass("toggled");
      });
  }) 
    this.ObtenerUsuarioActual();
    // this.ObtenerAprobadores();
  };

  clickEvent(){
    this.status = !this.status;       
}

  ObtenerUsuarioActual() {
    this.spinner.show();
    this.Servicios.ObtenerUsuarioActual().then(
      async (respuesta) => {
        this.usuarioActual = respuesta;
        console.log(this.usuarioActual);
        this.nombreUsuario = respuesta.Title;
        await this.ObtnenerAnticiposPendientes();
        await this.ObtenerAnticiposSinLegalizar();
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
        if(this.pendientes.length >= 2) this.bloquearSolicitud = true;
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

  async ObtenerAnticiposSinLegalizar() {
    await this.Servicios.ConsultarAnticiposSinLegalizar(this.usuarioActual.Id).then(
      (respuesta) => {
        this.anticiposSinLegalizar = respuesta
      }
    )
  }

  async ObtenerEmpleado(id: number) {
    await this.Servicios.ConsultarUsuarioEmpleados(id).then(
      (respuesta) => {
        this.empresa = respuesta[0].Empresa
        if(respuesta[0].UrlFirma) this.firma = respuesta[0].UrlFirma.Url;
        this.ObtenerAprobadores(respuesta[0].Empresa);
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

  async ObtenerAprobadores(empresa) {
    await this.Servicios.ConsultarAprobadores(empresa).then(
      async (respuesta) => {
        console.log(respuesta);
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
      noLegalizados: this.anticiposSinLegalizar,
      gerente: this.gerenteAdmin,
      usuario: {
        Id: this.usuarioActual.Id,
        Title: this.usuarioActual.Title,
        EMail: this.usuarioActual.Email,
        Firma: this.firma,
        Empresa: this.empresa
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

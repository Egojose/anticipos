import { Injectable } from '@angular/core';
import { sp, IEmailProperties } from "@pnp/sp/presets/all";
import { environment } from "src/environments/environment";


@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  constructor() { }

  Configuracion() {
    const configuracionSharepoint = sp.configure({
      headers: {
        "Accept": "application/json; odata=verbose"
      }
    }, environment.urlWeb)

    return configuracionSharepoint;
  }

  ConfiguracionGH() {
    const configuracionSharepoint = sp.configure({
      headers: {
        "Accept": "application/json; odata=verbose"
      }
    }, environment.urlGH)

    return configuracionSharepoint;
  }

  ConfiguracionJobs() {
    const configuracionSharepoint = sp.configure({
      headers: {
        "Accept": "application/json; odata=verbose"
      }
    }, environment.urlJobs)

    return configuracionSharepoint;
  }

  ConfiguracionPostman() {
    const configuracionSharepoint = sp.configure({
      headers: {
        "Accept": "application/json; odata=verbose",
        'Content-Type': 'application/json;odata=verbose',
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IllNRUxIVDBndmIwbXhvU0RvWWZvbWpxZmpZVSIsImtpZCI6IllNRUxIVDBndmIwbXhvU0RvWWZvbWpxZmpZVSJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvZW5vdmVsc29sdWNpb25lcy5zaGFyZXBvaW50LmNvbUA5MjAwNDBiMy1jMjIwLTQ4YTItYTczZi0xMTc3ZmEyYzA5OGUiLCJpc3MiOiIwMDAwMDAwMS0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDBAOTIwMDQwYjMtYzIyMC00OGEyLWE3M2YtMTE3N2ZhMmMwOThlIiwiaWF0IjoxNTg2NzkyMjUwLCJuYmYiOjE1ODY3OTIyNTAsImV4cCI6MTU4Njg3ODk1MCwiaWRlbnRpdHlwcm92aWRlciI6IjAwMDAwMDAxLTAwMDAtMDAwMC1jMDAwLTAwMDAwMDAwMDAwMEA5MjAwNDBiMy1jMjIwLTQ4YTItYTczZi0xMTc3ZmEyYzA5OGUiLCJuYW1laWQiOiI0MTMxMjQ4ZC1iMDliLTQ4ZmItOWE5Ni04MTdjNTU5NzI3YTFAOTIwMDQwYjMtYzIyMC00OGEyLWE3M2YtMTE3N2ZhMmMwOThlIiwib2lkIjoiNjlkOTMxNmItY2ZjOS00MWNkLTk0MjctN2Y0YTc1OWY2MzY0Iiwic3ViIjoiNjlkOTMxNmItY2ZjOS00MWNkLTk0MjctN2Y0YTc1OWY2MzY0IiwidHJ1c3RlZGZvcmRlbGVnYXRpb24iOiJmYWxzZSJ9.E3WrjFKjU7IyaCN-oLlQeeak7XNqiTs5NZxVYJ1ChzgkjLIh17nYZ-5FqeOghxl3eQWHoirTKBUq3vOCOlnHYLIgiMKhC86XXPuZdOkZHoApU8aA8U7erRdL3HgF8V1B48WBzATZyY1CRtlGu8-RlttO6iTArGBk4ApeBKBHRIHiBKEE7SFbxSuPO23wmNQ5k4UP2m3VM-qgyA2otEzamZ4BCv1B8VDiOGa5NgUIDdZ_1k-SvjhZZVufILXRSKkLhcQBF06_Fw6SiPm6bKfaUAKT1HaI02mib8zm_y55_EFyskoQyIt3cW0KFJE63b2t3im_MC8KWitUNdXufjNvLw'
      }

    }, environment.urlWeb)

    return configuracionSharepoint;
  }

  ObtenerTodosLosUsuarios() {
    let respuesta = this.Configuracion().web.siteUsers.get();
    return respuesta;
  }

  ObtenerUsuarioActual() {
    let respuesta = this.Configuracion().web.currentUser.get();
    return respuesta;
  }

  ConsultarUnidadNegocio() {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaUnidades).items
    .select('*', 'Director/Title, Director/EMail, Director/ID').expand('Director').getAll();
    return respuesta;
  }

  ConsultarTipoGasto() {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaTipoGasto).items
    .select('*').getAll();
    return respuesta; 
  }

  ConsultarConsecutivo() {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaConfiguarcion).items
    .select('*').filter("NombreServicio eq 'Solicitud de anticipo'").getAll();
    return respuesta;
  }

  ConsultarClientes() {
    let respuesta = this.ConfiguracionJobs().web.lists.getByTitle(environment.listaProyectos).items
    .select('*', 'Cliente/NombreCliente').expand('Cliente').getAll();
    return respuesta;
  }

  ActualizarConsecutivo(id: number, obj: Object) {
    let respuesta = this.Configuracion().web.lists
    .getByTitle(environment.listaConfiguarcion).items.getById(id).update(obj);
    return respuesta;
  }

  GuardarAnticipo(obj: Object) {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaAnticipos).items.add(obj);
    return respuesta;
  }

  ConsultarAnticipos(id: number) {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaAnticipos).items
    .select('*', 'Responsable/Title, Responsable/ID, Responsable/EMail').expand('Reponsable')
    .filter("ID eq '" + id + "'");
    return respuesta;
  }

  // ConsultarTodosAnticipos(fitlerString) {
  //   let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaAnticipos).items
  //   .select('*', 'Solicitante/Title, Solicitante/EMail, Solicitante/Id').expand('Solicitante')
  //   .filter(fitlerString).getAll();
  //   return respuesta;
  // }

  ConsultarTodosAnticipos() {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaAnticipos).items
    .select('*', 'Solicitante/Title, Solicitante/EMail, Solicitante/Id').expand('Solicitante').getAll();
    return respuesta;
  }

  ConsultarTodosAnticiposXusuraio(id: number) {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaAnticipos).items
    .select('*', 'Solicitante/Title, Solicitante/EMail, Solicitante/Id', 'Responsable/Title, Responsable/EMail, Responsable/Id')
    .expand('Solicitante', 'Responsable')
    .filter("Solicitante eq '"+id+"' and Legalizado eq 0 and Cancelado eq 0")
    .getAll();
    return respuesta;
  }

  ConsultarEmpresas() {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaEmpresas).items.select('*').getAll();
    return respuesta;
  }

  ConsultarPendientes(idUsuario: number) {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaAnticipos).items
    .select('*', 'Responsable/Title, Responsable/EMail, Responsable/ID', 'Solicitante/Title, Solicitante/EMail, Solicitante/ID')
    .expand('Responsable, Solicitante')
    .filter("Responsable eq '"+idUsuario+"' and Legalizado eq 0").getAll();
    return respuesta;
  }

  ConsultarAnticiposSinLegalizar(idUsuario: number) {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaAnticipos).items
    .select('*', 'Responsable/Title, Responsable/EMail, Responsable/ID', 'Solicitante/Title, Solicitante/EMail, Solicitante/ID')
    .expand('Responsable, Solicitante')
    .filter("Solicitante eq '"+idUsuario+"' and Legalizado eq 0").getAll();
    return respuesta;
  }

  ConsultarUsuarioEmpleados(id: number) {
    let respuesta = this.ConfiguracionGH().web.lists.getByTitle(environment.listaEmpleados).items
    .select('*').filter("usuarioId eq '"+ id +"'").getAll();
    return respuesta;
  }

  ConsultarEmpleados() {
    let respuesta = this.ConfiguracionGH().web.lists.getByTitle(environment.listaEmpleados).items
    .select('*', 'usuario/Title, usuario/Id').expand('usuario').getAll();
    return respuesta;
  }

  ConsultarAprobadores(empresa: string) {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaAprobadores)
    .items.select('*',
      'GerenteAdministrativo/Title, GerenteAdministrativo/EMail, GerenteAdministrativo/ID',
      'Tesorero/Title, Tesorero/EMail, Tesorero/ID',
      'Contador/Title, Contador/EMail, Contador/ID'
    )
    .expand('GerenteAdministrativo, Tesorero, Contador')
    .filter("Empresa eq '"+empresa+"'").getAll();
    return respuesta;
  }

  EnviarCorreo(ObjEmail: IEmailProperties) {
    const respuesta = this.Configuracion().utility.sendEmail(ObjEmail);
    return respuesta;
  }

  ActualizarAnticipo(id: number, obj: object) {
    let respuesta = this.Configuracion().web.lists.getByTitle(environment.listaAnticipos).items
    .getById(id).update(obj);
    return respuesta;
  }

  async AgregarDocumentos(biblioteca: string, nombre: string, archivo: File): Promise<any> {
    const respuesta = await this.Configuracion()
      .web.getFolderByServerRelativeUrl(biblioteca)
      .files.add(nombre, archivo);
    return respuesta;
  }

}


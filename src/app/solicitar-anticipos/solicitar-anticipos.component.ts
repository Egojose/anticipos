import { Component, OnInit } from '@angular/core';
import { ServiciosService } from '../servcios/servicios.service'
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router'
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { IEmailProperties } from "@pnp/sp/presets/all";

@Component({
  selector: 'app-solicitar-anticipos',
  templateUrl: './solicitar-anticipos.component.html',
  styleUrls: ['./solicitar-anticipos.component.css']
})
export class SolicitarAnticiposComponent implements OnInit {

  displayedColumns: string[] = ['Director', 'Ceco', 'Unidad', 'Porcentaje', 'Acciones'];
  columnsDetalle: string[] = ['Tipo', 'Descripcion', 'Cantidad', 'Moneda', 'ValorUnitario', 'ValorTotal', 'Acciones']
  form: FormGroup;
  fecha = new Date();
  Empresas = []
  usuarioActual: Object;
  datosString: any;
  datosJson: any;
  mostrarCampos = false;
  Aprobadores = [];
  usuariosAprobadores: any = [];
  participacion = new MatTableDataSource(this.usuariosAprobadores);
  sumaTotal = 0;
  tipoGasto = [];
  detalleAnticipo = new MatTableDataSource();
  consecutivos = [];
  consecutivo: string;
  responsable: any;
  habilitarBtn: boolean;
  nuevoConsecutivo: any;
  clientes = [];
  nroJob = [];

  constructor(public Servicios: ServiciosService, public fb: FormBuilder, public router: Router, public toastr: ToastrService, public spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    if(!sessionStorage.getItem('datosUsuario')) {
      this.router.navigate(['/home']);
      return;
    }
    this.datosString = sessionStorage.getItem('datosUsuario');
    this.datosJson = JSON.parse(this.datosString);
    console.log(this.datosJson.usuario);
    this.form = this.fb.group({
      Titulo: ['', Validators.required],
      Descripcion: ['', Validators.required],
      Empresa: ['', Validators.required],
      Fecha: ['', Validators.required],
      Consecutivo: ['', Validators.required],
      TipoSolicitud: ['Anticipo'],
      Reembolsable: ['false'],
      Cliente: [''],
      Job: [''],
      fechaFinalizacion: ['', Validators.required],
      Director: [''],
      Porcentaje: [''],
      tipoGasto: [''],
      DescripcionAnticipo: [''],
      Cantidad: [''],
      ValorUnitario: [''],
      Moneda: [''],
      totalPesos: [''],
      totalDolares: [''],
      totalEuros: ['']
    })
    this.usuarioActual = this.datosJson.usuario;
    this.ObtenerEmpresas();
    this.ObtenerUnidadNegocios();
    this.ObtenerTipoGasto();
    this.ObtenerConsecutivo();
    this.ObtenerClientes();
    console.log(this.fecha)
    this.form.controls.Fecha.setValue(this.formatearFecha(this.fecha))
  }

  formatearFecha(date: Date) {
    let date1: string;
    date.getDate() < 10 ? date1 = `0${date.getDate()}` : date1 = date.getDate().toString();
    let date2: string;
    (date.getMonth() + 1) < 10 ? date2 = `0${(date.getMonth() + 1)}` : date2 = (date.getMonth() + 1).toString();
    let date3 = date.getFullYear().toString();
    return `${date1}/${date2}/${date3}`
  }

  ObtenerEmpresas() {
    this.Servicios.ConsultarEmpresas().then(
      (respuesta) => {
        this.Empresas = respuesta;
        console.log(this.Empresas);
      }
    )
  }

  ObtenerUnidadNegocios() {
    this.Servicios.ConsultarUnidadNegocio().then(
      (respuesta) => {
        this.Aprobadores = respuesta;
      }
    )
  }

  ObtenerTipoGasto() {
    this.Servicios.ConsultarTipoGasto().then(
      (respuesta) => {
        this.tipoGasto = respuesta;
      }
    )
  }

  ObtenerClientes() {
    this.Servicios.ConsultarClientes().then(
      (respuesta) => {
        this.clientes = respuesta;
        console.log(this.clientes)
      }
    )
  }

  ObtenerConsecutivo() {
    this.Servicios.ConsultarConsecutivo().then(
      (respuesta) => {
        this.consecutivos = respuesta;
        console.log(this.consecutivos[0]);
      }
    )
  }

  AsignarConsecutivo($event) {
    console.log($event);
    if($event === 'Enovel Consultores') this.consecutivo = this.consecutivos[0].ConsecutivoConsultores;
    if($event === 'Enovel Asociados')this.consecutivo = this.consecutivos[0].ConsecutivoAsociados;
    this.form.controls.Consecutivo.setValue(this.consecutivo);
    // this.validarConsecutivo(this.form.controls.Consecutivo.value);
  }

  filtrarNroJob($event) {
    this.nroJob = this.clientes.filter((x) => x.Cliente.NombreCliente === $event)
  }

  mostrarCliente($event) {
    this.mostrarCampos;
    $event === 'true' ? this.mostrarCampos = true: this.mostrarCampos = false;
    $event === 'false' && this.limpiarCampos();
  }

  limpiarCampos() {
    this.form.controls.Cliente.setValue('');
    this.form.controls.Job.setValue('');
  }

  validar(condicion: boolean, mensaje: string) {
    if(condicion) {
      this.mostrarAdvertencia(mensaje);
      return true;
    }
  }

  habilitarBtnParticipacion() {
    if(this.form.controls.Director.value.Director) {
      this.habilitarBtn = true;
    }
  }

  AgregarParticipacion() {
    let contador = 0;
    this.validar((!this.form.controls.Porcentaje.value || this.form.controls.Porcentaje.value === ''), 'Debe agregar un porcentaje') && contador++

    if(contador > 0) {
      return false;
    }

    if(this.sumaTotal > 100) {
      this.mostrarAdvertencia('El porcentaje de los aprobadores no debe ser mayor a 100');
      return false;
    }
    
    let aprobador = {
      Director: this.form.controls.Director.value.Director,
      Ceco: this.form.controls.Director.value.Ceco,
      UnidadNegocio: this.form.controls.Director.value.Title,
      Porcentaje: +this.form.controls.Porcentaje.value,
      aprobado: false,
      rol: 'Director unidad de negocio'
    }
    let suma = 0;
    this.usuariosAprobadores.push(aprobador);
    this.participacion.data = this.usuariosAprobadores;
    this.usuariosAprobadores.forEach((el) => {
      console.log(el.Porcentaje)
      suma = suma + el.Porcentaje
      if(suma > 100) {
        this.mostrarAdvertencia('El porcentaje de los aprobadores no debe ser mayor a 100');
        suma = suma - this.usuariosAprobadores[this.usuariosAprobadores.length - 1].Porcentaje
        this.usuariosAprobadores.pop();
        this.participacion.data = this.usuariosAprobadores;
        return false;
      }
    })
    this.sumaTotal = suma
    this.limpiarAprobador();
  }

  limpiarAprobador() {
    this.habilitarBtn = false;
    this.form.controls.Director.setValue('');
    this.form.controls.Porcentaje.setValue('');
  }

  AgregarDetalle() {
    let contador = 0
    this.validar((!this.form.controls.tipoGasto.value || this.form.controls.tipoGasto.value === ''), 'El tipo de gasto es obligatorio') && contador++;
    this.validar((!this.form.controls.DescripcionAnticipo.value || this.form.controls.DescripcionAnticipo.value === ''), 'La descripción del anticipo es obligatoria') && contador++;
    this.validar((!this.form.controls.Cantidad.value || this.form.controls.Cantidad.value === ''), 'La cantidad es obligatoria') && contador++;
    this.validar((!this.form.controls.ValorUnitario.value || this.form.controls.ValorUnitario.value === ''), 'El valor unitario es obligatorio') && contador++;
    this.validar((!this.form.controls.Moneda.value || this.form.controls.Moneda.value === ''), 'La moneda es obligatoria') && contador++;

    if(contador > 0) {
      return false;
    }

    let detalle = {
      tipoGasto: this.form.controls.tipoGasto.value,
      descripcion: this.form.controls.DescripcionAnticipo.value,
      cantidad: parseInt(this.form.controls.Cantidad.value),
      valorUnitario: parseInt(this.form.controls.ValorUnitario.value),
      valorTotal: (this.form.controls.ValorUnitario.value * this.form.controls.Cantidad.value),
      moneda: this.form.controls.Moneda.value
    }
    this.detalleAnticipo.data.push(detalle);
    console.log(this.detalleAnticipo.data);
    this.detalleAnticipo.data = this.detalleAnticipo.data;
    let pesos = this.SumarTotales(this.detalleAnticipo.data, 'Peso');
    let dolar = this.SumarTotales(this.detalleAnticipo.data, 'Dolar');
    let euro = this.SumarTotales(this.detalleAnticipo.data, 'Euro');
    this.form.controls.totalPesos.setValue(pesos);
    this.form.controls.totalDolares.setValue(dolar);
    this.form.controls.totalEuros.setValue(euro);
    this.LimpiarDetalle();
  }

  LimpiarDetalle() {
    this.form.controls.tipoGasto.setValue('');
    this.form.controls.DescripcionAnticipo.setValue('');
    this.form.controls.Cantidad.setValue('');
    this.form.controls.ValorUnitario.setValue('');
    this.form.controls.Moneda.setValue('');
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

  EliminarAprobador(index: number) {
    let suma = 0;
    this.usuariosAprobadores.splice(index, 1);
    this.participacion.data = this.usuariosAprobadores;
    this.usuariosAprobadores.forEach((el: any) => {
       suma = suma + (+el.Porcentaje);
    })
    this.sumaTotal = suma;
    console.log(this.sumaTotal);
  }
  
  EliminarDetalle(index) {
    this.detalleAnticipo.data.splice(index, 1);
    this.detalleAnticipo.data = this.detalleAnticipo.data;
    console.log(this.detalleAnticipo.data);
  }

  async validarConsecutivo(str: string) {
    let consecutivos;
    await this.Servicios.ConsultarConsecutivo().then(
      (respuesta) => {
        consecutivos = respuesta;
      }
    )
    let consecutivoAcomparar: string;
    let empresa = this.form.controls.Empresa.value.RazonSocial
    empresa === 'Enovel Consultores' ? consecutivoAcomparar = consecutivos[0].ConsecutivoConsultores : consecutivoAcomparar = consecutivos[0].ConsecutivoAsociados;
    this.form.controls.Consecutivo.setValue(consecutivoAcomparar);
    let consNumber;
    let identificador = (+consecutivoAcomparar.split('-')[1]) + 1;
    if(identificador < 10 && empresa === 'Enovel Consultores') consNumber = `C-0${identificador}`;
    if(identificador < 100 && empresa === 'Enovel Consultores') consNumber = `C-00${identificador}`;
    if(identificador < 10 && empresa === 'Enovel Asociados') consNumber = `A-0${identificador}`;
    if(identificador < 100 && empresa === 'Enovel Asociados') consNumber = `A-00${identificador}`;
    this.nuevoConsecutivo = consNumber;
  }

  async GuardarAnticipo() {
    this.spinner.show()
    await this.validarConsecutivo(this.form.controls.Consecutivo.value);
    let contador = 0
    this.validar(this.form.invalid, 'Hay campos requeridos sin diligenciar') && contador++;
    this.validar((this.usuariosAprobadores.length === 0), 'Debe seleccionar al menos un aprobador') && contador++;
    this.validar((this.sumaTotal !== 100), 'Revise el porcentaje de los aprobadores. Recuerde que debe ser igual a 100') && contador++;
    this.validar((this.detalleAnticipo.data.length === 0), 'El detalle del anticipo parece estar vacío. Por favor revise') && contador++;

    if(contador > 0) {
      this.spinner.hide()
      return false;
    }

    this.responsable = this.usuariosAprobadores[0].Director;
    let Title = this.form.controls.Titulo.value;
    let Descripcion = this.form.controls.Descripcion.value;
    let SolicitanteId = this.datosJson.usuario.Id;
    let ResponsableId = this.responsable.ID;
    let Empresa = this.form.controls.Empresa.value.RazonSocial;
    let Consecutivo = this.form.controls.Consecutivo.value;
    let Reembolsable = this.mostrarCampos;
    let Cliente = this.form.controls.Cliente.value;
    let Job = this.form.controls.Job.value;
    let DetalleAnticipo = JSON.stringify(this.detalleAnticipo.data);
    let Estado = 'Por aprobar'
    let TipoSolicitud = this.form.controls.TipoSolicitud.value;
    let Aprobadores = JSON.stringify(this.usuariosAprobadores);
    let FechaFinalizacion = this.form.controls.fechaFinalizacion.value;
    let FirmaSolicitante = this.datosJson.usuario.Firma

    let obj = {
      Title,
      Descripcion,
      SolicitanteId,
      ResponsableId,
      Empresa,
      Consecutivo,
      Reembolsable,
      Cliente,
      Job,
      DetalleAnticipo,
      Estado,
      TipoSolicitud,
      Aprobadores,
      FechaFinalizacion,
      FirmaSolicitante
    }

    let objConsecutivo = {}
    Empresa === 'Enovel Consultores' ? objConsecutivo = { ConsecutivoConsultores: this.nuevoConsecutivo } : objConsecutivo = { ConsecutivoAsociados: this.nuevoConsecutivo }

    await this.GuardarDatos(obj, this.consecutivos[0].Id, objConsecutivo, Empresa);
  }

  async GuardarDatos(obj: Object, consecutivo: number, objConsecutivo: Object, empresa: string) {
    await this.Servicios.GuardarAnticipo(obj).then(
      async (respuesta) => {
        this.mostrarExitoso('El anticipo se guardó correctamente');
        await this.ActualizarConsecutivo(consecutivo, objConsecutivo, empresa);
        await this.envairNotificacion();
        sessionStorage.clear();
        this.router.navigate(['/home']);
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo guardar el anticipo');
        this.spinner.hide();
        console.error(`Guardar anticipo  ${err}`)
      }
    )
  };

  async envairNotificacion() {
    let cuerpo = '<p>Hola</p>' + '<br>' +
    'El usuario <b>' + this.datosJson.usuario.Title + '</b> ha solicitado un anticipo el cual requiere de su aprobación' + '<br>' +
    'Para ver sus actividades pendientes haga click <a href="http://localhost:4200/mis-pendientes">aquí</a>'

    let emailProps: IEmailProperties = {
      To: [this.responsable.EMail],
      Subject: 'Solicitud de anticipos',
      Body: cuerpo,
    };

    await this.Servicios.EnviarCorreo(emailProps);
  }

  async ActualizarConsecutivo(id: number, obj: Object, empresa: string) {
    await this.Servicios.ActualizarConsecutivo(id, obj).then(
      (respuesta) => {
        this.mostrarInformacion(`se actualizó el consecutivo de ${empresa}`)
      }
    ).catch(
      (err) => {
        this.mostrarError('No se pudo actualizar el consecutivo');
        this.spinner.hide();
        console.error(`Consecutivo ${err}`)
      }
    )
  }; 

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

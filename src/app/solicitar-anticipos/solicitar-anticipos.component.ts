import { Component, OnInit } from '@angular/core';
import { ServiciosService } from '../servcios/servicios.service'
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router'
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-solicitar-anticipos',
  templateUrl: './solicitar-anticipos.component.html',
  styleUrls: ['./solicitar-anticipos.component.css']
})
export class SolicitarAnticiposComponent implements OnInit {

  displayedColumns: string[] = ['Director', 'Ceco', 'Porcentaje', 'Acciones'];
  columnsDetalle: string[] = ['Tipo', 'Descripcion', 'Cantidad', 'Moneda', 'ValorUnitario', 'ValorTotal', 'Acciones']
  form: FormGroup;
  fecha = new Date();
  Empresas = []
  usuarioActual: Object;
  datosString: any;
  datosJson: any;
  mostrarCampos: boolean;
  Aprobadores = [];
  usuariosAprobadores: any = [];
  participacion = new MatTableDataSource(this.usuariosAprobadores);
  sumaTotal = 0;
  tipoGasto = [];
  detalleAnticipo = new MatTableDataSource();
  consecutivos = [];
  consecutivo: string;
  responsable: any;
  noGuardar: boolean;

  constructor(public Servicios: ServiciosService, public fb: FormBuilder, public router: Router, public toastr: ToastrService, public spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    if(!sessionStorage.getItem('datosUsuario')) {
      this.router.navigate(['/home'])
    }
    this.datosString = sessionStorage.getItem('datosUsuario');
    this.datosJson = JSON.parse(this.datosString);
    console.log(this.datosJson);
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
    console.log(this.fecha)
    this.form.controls.Fecha.setValue(this.formatearFecha(this.fecha))
  }

  formatearFecha(date: Date) {
    let date1: string;
    date.getDate() < 10 ? date1 = `0${date.getDate()}` : date1 = date.getDate().toString();
    let date2: string;
    date.getMonth() < 10 ? date2 = `0${date.getMonth()}` : date2 = date.getMonth().toString();
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

  AgregarParticipacion() {
    console.log(`total suma ${this.sumaTotal}`)
    if(this.sumaTotal > 100) {
      this.mostrarAdvertencia('El porcentaje de los aprobadores no debe ser mayor a 100');
      return false;
    }
    let aprobador = {
      Director: this.form.controls.Director.value.Director,
      Ceco: this.form.controls.Director.value.Ceco,
      Porcentaje: +this.form.controls.Porcentaje.value
    }
    let suma = 0;
    this.usuariosAprobadores.push(aprobador);
    this.participacion.data = this.usuariosAprobadores;
    this.usuariosAprobadores.forEach((el: any) => {
      suma + el.Porcentaje
    })
    this.sumaTotal = suma
    if(this.sumaTotal > 100) {
      this.usuariosAprobadores.pop();
      this.participacion.data = this.usuariosAprobadores;
      this.mostrarAdvertencia('El porcentaje de los aprobadores no debe ser mayor a 100');
      return false;
    }
    console.log(this.sumaTotal);
    this.limpiarAprobador();
    console.log(this.usuariosAprobadores);
  }

  limpiarAprobador() {
    this.form.controls.Director.setValue('');
    this.form.controls.Porcentaje.setValue('');
  }

  AgregarDetalle() {
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
    console.log(`pesos ${pesos}/ dolar ${dolar}/ euro ${euro}`)
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
       suma + (+el.Porcentaje);
    })
    this.sumaTotal = suma;
    console.log(this.sumaTotal);
  }
  
  EliminarDetalle(index) {
    this.detalleAnticipo.data.splice(index, 1);
    this.detalleAnticipo.data = this.detalleAnticipo.data;
    console.log(this.detalleAnticipo.data);
  }

  validar(condicion: boolean, mensaje: string) {
    if(condicion) {
      this.mostrarAdvertencia(mensaje);
      this.noGuardar = true
      return false;
    }
  }

  async GuardarAnticipo() {
    this.spinner.show()
    this.validar(this.form.invalid, 'Hay campos requeridos sin diligenciar');
    this.validar((this.usuariosAprobadores.length === 0), 'Debe seleccionar al menos un aprobador');
    // this.validar((this.sumaTotal < 100 || this.sumaTotal > 100), 'Revise el porcentaje de los aprobadores. Recuerde que debe ser igual a 100');
    this.validar((this.detalleAnticipo.data.length === 0), 'El detalle del anticipo parece estar vacío. Por favor revise');

    if(this.noGuardar) {
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
    // let IdCompraAsociada = this.form.controls.IdCompra.value;
    let Reembolsable = this.mostrarCampos;
    let Cliente = this.form.controls.Cliente.value;
    let Job = this.form.controls.Job.value;
    let DetalleAnticipo = JSON.stringify(this.detalleAnticipo.data);
    let Estado = 'Por aprobar'
    let TipoSolicitud = this.form.controls.TipoSolicitud.value;
    let Aprobadores = JSON.stringify(this.usuariosAprobadores)

    let obj = {
      Title,
      Descripcion,
      SolicitanteId,
      ResponsableId,
      Empresa,
      Consecutivo,
      // IdCompraAsociada,
      Reembolsable,
      Cliente,
      Job,
      DetalleAnticipo,
      Estado,
      TipoSolicitud,
      Aprobadores
    }

    let objConsecutivo = {}
    Empresa === 'Enovel Consultores' ? objConsecutivo = {ConsecutivoConsultores: 'Consultores'} : objConsecutivo = {ConsecutivoAsociados: 'Asociados'}

    await this.GuardarDatos(obj, this.consecutivos[0].Id, objConsecutivo, Empresa);
  }

  async GuardarDatos(obj: Object, consecutivo: number, objConsecutivo: Object, empresa: string) {
    await this.Servicios.GuardarAnticipo(obj).then(
      async (respuesta) => {
        this.mostrarExitoso('El anticipo se guardó correctamente');
        await this.ActualizarConsecutivo(consecutivo, objConsecutivo, empresa);
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

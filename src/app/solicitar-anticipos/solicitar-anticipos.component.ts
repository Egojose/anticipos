import { Component, OnInit } from '@angular/core';
import { ServiciosService } from '../servcios/servicios.service'
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router'

@Component({
  selector: 'app-solicitar-anticipos',
  templateUrl: './solicitar-anticipos.component.html',
  styleUrls: ['./solicitar-anticipos.component.css']
})
export class SolicitarAnticiposComponent implements OnInit {

  displayedColumns: string[] = ['Director', 'Ceco', 'Porcentaje', 'Acciones'];
  form: FormGroup;
  detalleAnticipo = [];
  fecha = new Date();
  Empresas = []
  usuarioActual: Object;
  datosString: any;
  datosJson: any;
  mostrarCampos: boolean;
  Aprobadores = [];
  participacion = [];

  constructor(public Servicios: ServiciosService, public fb: FormBuilder, public router: Router) { }

  ngOnInit(): void {
    if(!sessionStorage.getItem('datosUsuario')) {
      this.router.navigate(['/home'])
    }
    this.datosString = sessionStorage.getItem('datosUsuario')
    this.datosJson = JSON.parse(this.datosString);
    console.log(this.datosJson);
    // sessionStorage.clear();
    this.form = this.fb.group({
      Titulo: ['', Validators.required],
      Descripcion: ['', Validators.required],
      Empresa: ['', Validators.required],
      Fecha: ['', Validators.required],
      Consecutivo: [''],
      IdCompra: [''],
      Reembolsable: ['', Validators.required],
      Cliente: [''],
      Job: [''],
      fechaFinalizacion: ['', Validators.required],
      Director: [''],
      Porcentaje: [''],
    })
    this.usuarioActual = this.datosJson.usuario;
    // this.ObtenerUsuarioActual();
    this.ObtenerEmpresas();
    this.ObtenerUnidadNegocios();
    console.log(this.fecha)
    this.form.controls.Fecha.setValue(this.formatearFecha(this.fecha))
  }

  // ObtenerUsuarioActual() {
  //   this.Servicios.ObtenerUsuarioActual().then(
  //     (respuesta) => {
  //       this.usuarioActual = respuesta;
  //       console.log(this.usuarioActual);
  //     }
  //   )
  // }

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

  mostrarCliente($event) {
    this.mostrarCampos;
    $event === 'true' ? this.mostrarCampos = true: this.mostrarCampos = false;
    if($event === 'false') this.limpiarCampos();
  }

  limpiarCampos() {
    this.form.controls.Cliente.setValue('');
    this.form.controls.Job.setValue('');
  }

  AgregarParticipacion() {
    let aprobador = {
      Director: this.form.controls.Director.value.Director,
      Ceco: this.form.controls.Director.value.Ceco,
      Porcentaje: parseInt(this.form.controls.Porcentaje.value)
    }
    this.participacion.push(aprobador);
    this.participacion = this.participacion;
    this.limpiarAprobador();
    console.log(this.participacion);
  }

  limpiarAprobador() {
    this.form.controls.Director.setValue('');
    this.form.controls.Porcentaje.setValue('');
  }

}

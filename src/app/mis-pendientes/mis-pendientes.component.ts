import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

@Component({
  selector: 'app-mis-pendientes',
  templateUrl: './mis-pendientes.component.html',
  styleUrls: ['./mis-pendientes.component.css']
})
export class MisPendientesComponent implements OnInit {
  displayedColumns = ['Titulo', 'Descripcion', 'Solicitante', 'Empresa', 'Estado', 'Acciones'];
  misPendientes
  pendientes;
  pendientesJson = []
  usuario = [];

  constructor(public router: Router) { }

  ngOnInit(): void {
    if(!sessionStorage.getItem('datosUsuario')) {
      this.router.navigate(['/']);
      return;
    }
   this.misPendientes = sessionStorage.getItem('datosUsuario')
   this.pendientes = JSON.parse(this.misPendientes);
   this.pendientesJson = this.pendientes.pendientes
   this.usuario.push(this.pendientes.usuario);
  //  this.gerente.push(this.pendientes.gerente)
  }

  Navegar(element) {
    this.pendientes.usuario.Firma = this.usuario[0].Firma
    let el = {
      pendiente: element,
      usuario: this.pendientes.usuario,
      // gerente: this.gerente
    }
    this.EnviarElemento(el)
    if(element.Estado === 'Por aprobar' || element.Estado === 'Por aprobar gerente administrativo') this.router.navigate(['/aprobar-anticipo']);
    element.Estado === 'Por desembolsar' && this.router.navigate(['/desembolsar-anticipo']);
    element.Estado === 'Por legalizar' && this.router.navigate(['/legalizar-anticipo']);
    (element.Estado === 'Guardado parcial' || element.Estado === 'Rechazado') && this.router.navigate(['/editar-legalizacion']);
    element.Estado === 'Por aprobar legalización' && this.router.navigate(['/aprobar-legalizacion']);
    element.Estado === 'Por confirmar' && this.router.navigate(['/confirmar-cerrar-anticipo']);
  }

  EnviarElemento(element) {
    sessionStorage.setItem('pendiente', JSON.stringify(element))
  }

}

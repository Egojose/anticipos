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
   this.misPendientes = sessionStorage.getItem('datosUsuario')
   this.pendientes = JSON.parse(this.misPendientes);
   this.pendientesJson = this.pendientes.pendientes
   this.usuario.push(this.pendientes.usuario);
   console.log(this.pendientesJson);
   console.log(this.usuario);
  }

  Navegar(element) {
    let el = {
      pendiente: element,
      firma: this.usuario[0].Firma
    }
    this.EnviarElemento(el)
    element.Estado === 'Por aprobar' && this.router.navigate(['/aprobar-anticipo']);
    element.Estado === 'Por legalizar' && alert('Por legalizar');
    element.Estado === 'Por desembolsar' && alert('Por desembolsar');
  }

  EnviarElemento(element) {
    sessionStorage.setItem('pendiente', JSON.stringify(element))
  }

}

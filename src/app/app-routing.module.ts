import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SolicitarAnticiposComponent } from './solicitar-anticipos/solicitar-anticipos.component';
import { AppComponent } from './app.component'
import { MisPendientesComponent } from './mis-pendientes/mis-pendientes.component';
import { AprobarAnticipoComponent } from './aprobar-anticipo/aprobar-anticipo.component';
import { ConsultarAnticiposComponent } from './consultar-anticipos/consultar-anticipos.component';


const routes: Routes = [
  {path: 'home', component: AppComponent},
  {path: 'solicitar-anticipo', component: SolicitarAnticiposComponent},
  {path: 'mis-pendientes', component: MisPendientesComponent},
  {path: 'aprobar-anticipo', component: AprobarAnticipoComponent},
  {path: 'consultar-anticipos', component: ConsultarAnticiposComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

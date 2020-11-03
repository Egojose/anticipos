import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SolicitarAnticiposComponent } from './solicitar-anticipos/solicitar-anticipos.component';
import { AppComponent } from './app.component'
import { MisPendientesComponent } from './mis-pendientes/mis-pendientes.component';
import { AprobarAnticipoComponent } from './aprobar-anticipo/aprobar-anticipo.component';
import { ConsultarAnticiposComponent } from './consultar-anticipos/consultar-anticipos.component';
import { LegalizarAnticipoComponent } from './legalizar-anticipo/legalizar-anticipo.component';
import { DesembolsarAnticipoComponent } from './desembolsar-anticipo/desembolsar-anticipo.component';
import { EditarLegalizacionComponent } from './editar-legalizacion/editar-legalizacion.component';
import { AprobarLegalizacionComponent } from './aprobar-legalizacion/aprobar-legalizacion.component';
import { MisSolicitudesComponent } from './mis-solicitudes/mis-solicitudes.component';


const routes: Routes = [
  {path: '', redirectTo: '/', pathMatch: 'full'},
  // {path: 'home', component: AppComponent},
  {path: 'solicitar-anticipo', component: SolicitarAnticiposComponent},
  {path: 'mis-pendientes', component: MisPendientesComponent},
  {path: 'aprobar-anticipo', component: AprobarAnticipoComponent},
  {path: 'consultar-anticipos', component: ConsultarAnticiposComponent},
  {path: 'legalizar-anticipo', component: LegalizarAnticipoComponent},
  {path: 'desembolsar-anticipo', component: DesembolsarAnticipoComponent},
  {path: 'editar-legalizacion', component: EditarLegalizacionComponent},
  {path: 'aprobar-legalizacion', component: AprobarLegalizacionComponent},
  {path: 'consultar-legalizacion', component: AprobarLegalizacionComponent},
  {path: 'consultar-anticipo', component: AprobarAnticipoComponent},
  {path: 'mis-solicitudes', component: MisSolicitudesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

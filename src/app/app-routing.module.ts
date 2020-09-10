import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SolicitarAnticiposComponent } from './solicitar-anticipos/solicitar-anticipos.component';
import { AppComponent } from './app.component'


const routes: Routes = [
  {path: 'home', component: AppComponent},
  {path: 'solicitar-anticipo', component: SolicitarAnticiposComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

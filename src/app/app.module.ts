import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SolicitarAnticiposComponent } from './solicitar-anticipos/solicitar-anticipos.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; 
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs'
import { MatRadioModule } from '@angular/material/radio'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core';
import { NgxSpinnerModule } from "ngx-spinner";
import { ToastrModule } from 'ngx-toastr';
import { NgxCurrencyModule } from "ngx-currency";
import { MisPendientesComponent } from './mis-pendientes/mis-pendientes.component';
import { AprobarAnticipoComponent } from './aprobar-anticipo/aprobar-anticipo.component';
import { ConsultarAnticiposComponent } from './consultar-anticipos/consultar-anticipos.component';
import { LegalizarAnticipoComponent } from './legalizar-anticipo/legalizar-anticipo.component';
import { DesembolsarAnticipoComponent } from './desembolsar-anticipo/desembolsar-anticipo.component';
import { EditarLegalizacionComponent } from './editar-legalizacion/editar-legalizacion.component';
import { AprobarLegalizacionComponent } from './aprobar-legalizacion/aprobar-legalizacion.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import {MatIconModule} from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdvertenciaSolicitudesComponent } from './advertencia-solicitudes/advertencia-solicitudes.component';
import { MisSolicitudesComponent } from './mis-solicitudes/mis-solicitudes.component'




@NgModule({
  declarations: [
    AppComponent,
    SolicitarAnticiposComponent,
    MisPendientesComponent,
    AprobarAnticipoComponent,
    ConsultarAnticiposComponent,
    LegalizarAnticipoComponent,
    DesembolsarAnticipoComponent,
    EditarLegalizacionComponent,
    AprobarLegalizacionComponent,
    AdvertenciaSolicitudesComponent,
    MisSolicitudesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    // MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxSpinnerModule,
    ToastrModule.forRoot(),
    MatRadioModule,
    MatTableModule,
    NgxCurrencyModule,
    ModalModule.forRoot(),
    MatIconModule,
    FontAwesomeModule
    
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }

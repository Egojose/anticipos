import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-advertencia-solicitudes',
  templateUrl: './advertencia-solicitudes.component.html',
  styleUrls: ['./advertencia-solicitudes.component.css']
})
export class AdvertenciaSolicitudesComponent implements OnInit {

  constructor() { }
  @Input() bloquearSolicitud: boolean;
  ngOnInit(): void {
  }

}

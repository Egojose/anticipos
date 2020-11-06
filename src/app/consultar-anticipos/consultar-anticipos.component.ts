import { Component, OnInit, TemplateRef } from '@angular/core';
import { ServiciosService } from '../servcios/servicios.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PdfMakeWrapper, Txt, Img, Table} from "pdfmake-wrapper";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { NgxSpinnerService } from 'ngx-spinner';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faFilePdf } from '@fortawesome/free-regular-svg-icons';


PdfMakeWrapper.setFonts(pdfFonts);
// declare var jsPDF: any;
@Component({
  selector: 'app-consultar-anticipos',
  templateUrl: './consultar-anticipos.component.html',
  styleUrls: ['./consultar-anticipos.component.css']
})
export class ConsultarAnticiposComponent implements OnInit {
  columnsDetalle: string[] = ['Titulo', 'Solicitante', 'Estado', 'FechaSolicitud', 'FechaFinalizacion', 'FechaLegalizacion', 'Anticipo', 'Legalizacion', 'Reportes', 'Facturas'];
  anticipos = [];
  modalRef: BsModalRef;
  data = [];
  resumen = [];
  fechaDesde;
  fechaHasta;
  estado;
  solicitante;
  solicitantes = [];
  estados = ['Por aprobar', 'Por aprobar gerente administrativo', 'Por desembolsar', 'Guardado parcial', 'Por legalizar', 'Por aprobar legalización', 'Legalizado'];
  arrayDetalle = [];
  arrayLegalizacion = [];
  dataInicial = [];
  arrayAprobadores = [];
  reembolsable: string;
  arrayDetalleAnticipo = [];
  totalAnticipoPesos: number;
  totalAnticipoDolares: number;
  totalAnticipoEuros: number;
  totalGastosPesos: number;
  totalGastosDolares: number;
  totalGastosEuros: number;
  totalSaldoPesos: number;
  totalSaldoDolares: number;
  totalSaldoEuros: number;
  saldoAfavorPesos: any;
  saldoAfavorDolares: any;
  saldoAfavorEuros: any;
  datosGerente = [];
  ver = faEye;
  verPdf = faFilePdf;


  constructor(public Servicios: ServiciosService, private modalService: BsModalService, public router: Router, public toastr: ToastrService, public spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.ConsultarEmpleados();
    this.ConsultarAnticipos();
  }

  ConsultarEmpleados() {
    this.Servicios.ConsultarEmpleados().then(
      (respuesta) => {
        this.solicitantes = respuesta;
        console.log(this.solicitantes);
      }
    )
  }

  Validar(condicion: boolean, mensaje: string) {
    if(condicion) {
      this.mostrarAdvertencia(mensaje);
      return true;
    }
  }

  Navegar(element, param: string) {
    let el = {
      pendiente: element,
      query: param
    }
    sessionStorage.setItem('pendiente', JSON.stringify(el))
    param === 'Anticipo' && this.router.navigate(['/consultar-anticipo']);
    param === 'Legalizacion' && this.router.navigate(['/consultar-legalizacion']);
  }

  ObtenerFormatoFecha(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  ConsultarAnticipos() {
    this.Servicios.ConsultarTodosAnticipos().then(
      (respuesta) => {
        this.anticipos = respuesta;
        console.log(this.anticipos);
      }
    )
  }

  SumarTotales(arr, moneda: string) {
    let suma = 0;
    let filterArr;
    filterArr = arr.filter((x) => {
      return x.moneda === moneda
    })
    console.log(filterArr);
    for (let i = 0; i < filterArr.length; i++) {
      let valor = filterArr[i].valorTotal
      suma = suma + valor
    }
    return suma;
  }

  SumarResumenLegalizacion(arr, moneda: string) {
    let suma = 0;
    for(let i = 0; i < arr.length; i++) {
      let valor = arr[i][moneda]
      suma = suma + valor;
    }
    return suma;
  }

  ConstruirArrayDatos(id: number) {
    this.spinner.show();
    this.dataInicial = this.anticipos.filter((x) => x.Id === id)
    console.log(this.dataInicial)
    this.data = JSON.parse(this.dataInicial[0].DetalleLegalizacion)
    console.log(this.data);
    this.arrayDetalle = this.data[0].detalle;
    this.arrayLegalizacion = this.data[0].resumen;
    let arraySaldoAfavor = this.data[0].saldoAfavor
    console.log(arraySaldoAfavor)
    this.arrayAprobadores = JSON.parse(this.dataInicial[0].Aprobadores);
    this.arrayDetalleAnticipo = JSON.parse(this.dataInicial[0].DetalleAnticipo)
    console.log(this.arrayAprobadores)
    console.log(this.arrayDetalleAnticipo);
    console.log(this.arrayLegalizacion);
    let arrGastos = this.arrayLegalizacion.filter((x) => x.tipo === 'Gastos');
    let arrSaldos = this.arrayLegalizacion.filter((x) => x.tipo === 'Saldo');
    console.log(arrGastos);
    console.log(arrSaldos);
    this.reembolsable = this.dataInicial[0].Reembolsable === true ? 'Sí': 'No';
    //totales anticipo
    this.totalAnticipoPesos = this.SumarTotales(this.arrayDetalleAnticipo, 'Peso')
    this.totalAnticipoDolares = this.SumarTotales(this.arrayDetalleAnticipo, 'Dolar');
    this.totalAnticipoEuros = this.SumarTotales(this.arrayDetalleAnticipo, 'Euro');
    //totales gastos
    this.totalGastosPesos = this.SumarResumenLegalizacion(arrGastos, 'Peso');
    this.totalGastosDolares = this.SumarResumenLegalizacion(arrGastos, 'Dolar');
    this.totalGastosEuros = this.SumarResumenLegalizacion(arrGastos, 'Euro');
    //totales saldos
    this.totalSaldoPesos = arrSaldos[arrSaldos.length - 1].Peso;
    this.totalSaldoDolares = arrSaldos[arrSaldos.length - 1].Dolar;
    this.totalSaldoEuros = arrSaldos[arrSaldos.length - 1].Euro;
    //saldo a favor
    if(arraySaldoAfavor.Peso) this.saldoAfavorPesos = arraySaldoAfavor.Peso;
    if(arraySaldoAfavor.Dolar) this.saldoAfavorDolares = arraySaldoAfavor.Dolar;
    if(arraySaldoAfavor.Euro) this.saldoAfavorEuros = arraySaldoAfavor.Euro
    setTimeout(() => {
      this.GenerafPdfLegalizacion();
      this.FormatearAprobadores(this.arrayAprobadores);
      this.spinner.hide();
    }, 3000);
    
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'gray modal-lg' })
    );
  }

  FormatearAprobadores(arr) {
    let data = arr.filter((x) => x.rol === 'Director unidad de negocio')
    let str: string;
    let array = []
    for(let i = 0; i < data.length; i++) {
      str = `${data[i].Director.Title} (${data[i].Porcentaje} %)`
      array.push(str);
    }
    console.log(array.toString())
    return array.toString().replace(',', ', ');
  }

  async GenerafPdfLegalizacion() {
    let firmaSolicitante = await new Img(this.dataInicial[0].FirmaSolicitante).width(250).margin([0, 0, 0, 0]).build();
    let firmaDirector = await new Img(this.arrayAprobadores[0].Director.Firma).width(250).margin([0, 0, 0, 0]).build();
    let logo = await new Img('assets/images/logoAraujo.png').width(200).margin([0, 0, 0, 0]).build();
    let version = '1.0'
    console.log(2)
    const pdf = new PdfMakeWrapper();
    pdf.add(
      new Table([
        [logo, {text: 'FORMATO', alignment: 'center', padding: 'auto'}, [
          {text: 'Código:', alignment: 'center', fontSize: 10}, {text: 'FCR-3-20-016', alignment: 'center', fontSize: 10}, {text: `Versión: ${version}`, alignment: 'center', fontSize: 10}
        ],
      ]
      ]).widths([210, 210, 100,]).margin([0,2, 0, 0]).end
    )
    pdf.add(
      new Table([
        [ [{text: 'Unidad de negocio', alignment: 'center', fontSize: 10, border: [false, false, false, false]}, {text: 'Administrativa y finaciera', alignment: 'center', fontSize: 9}], {text: 'LEGALIZACIÓN DE GASTOS DE ANTICIPO O REINTEGRO', alignment: 'center', paddingTop: 3, fontSize: 9, border: [true, false, false, true]}, [
          {text: 'Fecha de vigencia:', alignment: 'center', fontSize: 10}, {text: '2018-01-01', alignment: 'center', fontSize: 10}
        ],
      ]
      ]).widths([210, 210, 100,]).margin([0,0, 0, 0]).end
    )
    pdf.add(
      new Txt(`Anticipo o Reintegro: Consecutivo ${this.dataInicial[0].Consecutivo}`).fontSize(18).bold().alignment('center').margin([10, 10, 10, 5]).end
    )
    pdf.add(
      new Txt('Propósito del anticipo o reintegro').fontSize(14).bold().alignment('left').margin([20, 10]).end
    )
    pdf.add(
      new Txt(`Titulo:                                    ${this.dataInicial[0].Title}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
      new Txt(`Descripción:                         ${this.dataInicial[0].Descripcion}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
      new Txt(`Reembolsable:                     ${this.reembolsable}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
      new Txt(`Solicitante:                            ${this.dataInicial[0].Solicitante.Title}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
      new Txt(`Empresa solicitante:           ${this.dataInicial[0].Empresa}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
      new Txt(`CeCo/ UN solictante:          ${this.arrayAprobadores[0].Ceco}/ ${this.arrayAprobadores[0].UnidadNegocio}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
      new Txt(`Fecha de solicitud:              ${this.ObtenerFormatoFecha(this.dataInicial[0].Created)}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
    new Txt(`Fecha de aprobación:         ${this.ObtenerFormatoFecha(this.dataInicial[0].FechaAprobacion)}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
    new Txt(`Fecha de finalización:         ${this.ObtenerFormatoFecha(this.dataInicial[0].FechaFinalizacion)}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
    new Txt(`Fecha de legalización:        ${this.ObtenerFormatoFecha(this.dataInicial[0].FechaLegalizacion)}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
      new Txt(`Aprobadores:                       ${this.FormatearAprobadores(this.arrayAprobadores)}`).fontSize(10).alignment('left').margin([20,0.5]).end
    )
    pdf.add(
      new Txt('Detalle gastos:').fontSize(13).bold().alignment('left').margin([0,10, 0, 0]).end
    )
    pdf.add(
      new Table([
        [{
          border: [true, true, false, true],
          text: 'Tipo',
          fillColor: '#121211',
          alignment: 'center',
          color: '#f5f5e4'
        }, {
          border: [true, true, false, true],
          text: 'Descripción',
          fillColor: '#121211',
          alignment: 'center',
          color: '#f5f5e4'
        }, {
          border: [true, true, false, true],
          text: 'Beneficiario',
          fillColor: '#121211',
          alignment: 'center',
          color: '#f5f5e4'
        },{
          border: [true, true, false, true],
          text: 'Valor total',
          fillColor: '#121211',
          alignment: 'center',
          color: '#f5f5e4'
        },{
          border: [true, true, false, true],
          text: 'Moneda',
          fillColor: '#121211',
          alignment: 'center',
          color: '#f5f5e4'
        }, {
          border: [true, true, false, true],
          text: 'Origen',
          fillColor: '#121211',
          alignment: 'center',
          color: '#f5f5e4'
        }, {
          border: [true, true, false, true],
          text: 'Destino',
          fillColor: '#121211',
          alignment: 'center',
          color: '#f5f5e4'
        }, {
          border: [true, true, false, true],
          text: 'Fecha inicio',
          fillColor: '#121211',
          alignment: 'center',
          color: '#f5f5e4'
        }, {
          border: [true, true, true, true],
          text: 'Fecha fin',
          fillColor: '#121211',
          alignment: 'center',
          color: '#f5f5e4'
        }, 
      ],
      ]).widths([50, 50, 50, 50, 50, 50, 50, 50, 50, ]).margin([0,2, 0, 0]).end
    );

    this.arrayDetalle.forEach((el) => {
      let fechaInicio = el.fechaInicio !== 'N/A' ? this.ObtenerFormatoFecha(el.fechaInicio) : 'N/A'
      let fechaFin = el.fechaFin !== 'N/A' ? this.ObtenerFormatoFecha(el.fechaFin) : 'N/A'
      pdf.add(
        new Table([
          [
            {
              border: [true, false, false, true],
              text: el.tipo,
              alignment: 'center',
              fillColor: '#eeeeee',
              fontSize: 9
            }, {
              border: [true, false, false, true],
              text: el.descripcion,
              alignment: 'center',
              fontSize: 9
            },{
              border: [true, false, false, true],
              text: el.beneficiario,
              alignment: 'center',
              fontSize: 9
            },{
              border: [true, false, false, true],
              text: el.valorTotal,
              alignment: 'center',
              fontSize: 9
            },{
              border: [true, false, false, true],
              text: el.moneda,
              alignment: 'center',
              fontSize: 9
            },{
              border: [true, false, false, true],
              text: el.origen,
              alignment: 'center',
              fontSize: 9
            },{
              border: [true, false, false, true],
              text: el.destino,
              alignment: 'center',
              fontSize: 9
            },{
              border: [true, false, false, true],
              text: fechaInicio,
              alignment: 'center',
              fontSize: 9
            },{
              border: [true, false, true, true],
              text: fechaFin,
              alignment: 'center',
              fontSize: 9
            },
          ]
        ]).widths([50, 50, 50, 50, 50, 50, 50, 50, 50, ]).margin([0, 0, 0, 0]).end
      )
    });
    pdf.add(
      new Txt('Resumen cuentas').fontSize(13).bold().alignment('left').margin([0,10, 0, 0]).end
    )
    pdf.add(
      new Table([
        [
          {
            border: [true, false, false, true],
            text: '',
            fillColor: '#121211',
            alignment: 'center',
            color: '#f5f5e4'
          }, {
            border: [true, false, false, true],
            text: 'Pesos',
            fillColor: '#121211',
            alignment: 'center',
            color: '#f5f5e4'
          },{
            border: [true, false, false, true],
            text: 'Dólares',
            fillColor: '#121211',
            alignment: 'center',
            color: '#f5f5e4'
          },{
            border: [true, false, true, true],
            text: 'Euros',
            fillColor: '#121211',
            alignment: 'center',
            color: '#f5f5e4'
          }
        ]
      ]).widths([100, 70, 70, 70,]).margin([0,2, 0, 0]).end
    );
    pdf.add(
      new Table([
        [
          {
            border: [true, false, false, true],
            text: 'Anticipo',
            alignment: 'center',
            fillColor: '#eeeeee',
          },{
            border: [true, false, false, true],
            text: this.totalAnticipoPesos,
            alignment: 'center',
          },{
            border: [true, false, false, true],
            text: this.totalAnticipoDolares,
            alignment: 'center',
          },{
            border: [true, false, true, true],
            text: this.totalAnticipoEuros,
            alignment: 'center',
          }
        ]
      ]).fontSize(10).widths([100, 70, 70, 70,]).margin([0,0, 0, 0]).end
    );
    pdf.add(
      new Table([
        [
          {
            border: [true, false, false, true],
            text: 'Gastos',
            alignment: 'center',
            fillColor: '#eeeeee',
          },{
            border: [true, false, false, true],
            text: this.totalGastosPesos,
            alignment: 'center',
          },{
            border: [true, false, false, true],
            text: this.totalGastosDolares,
            alignment: 'center',
          },{
            border: [true, false, true, true],
            text: this.totalGastosEuros,
            alignment: 'center',
          }
        ]
      ]).fontSize(10).widths([100, 70, 70, 70,]).margin([0,0, 0, 0]).end
    );
    pdf.add(
      new Table([
        [
          {
            border: [true, false, false, true],
            text: 'Saldo',
            alignment: 'center',
            fillColor: '#eeeeee',
          },{
            border: [true, false, false, true],
            text: this.totalSaldoPesos,
            alignment: 'center',
          },{
            border: [true, false, false, true],
            text: this.totalSaldoDolares,
            alignment: 'center',
          },{
            border: [true, false, true, true],
            text: this.totalSaldoEuros,
            alignment: 'center',
          }
        ]
      ]).fontSize(10).widths([100, 70, 70, 70,]).margin([0,0, 0, 0]).end
    );
    pdf.add(
      new Table([
        [
          {
            border: [true, false, false, true],
            text: 'A favor de',
            alignment: 'center',
            fillColor: '#eeeeee',
          },{
            border: [true, false, false, true],
            text: this.saldoAfavorPesos,
            alignment: 'center',
          },{
            border: [true, false, false, true],
            text: this.saldoAfavorDolares,
            alignment: 'center',
          },{
            border: [true, false, true, true],
            text: this.saldoAfavorEuros,
            alignment: 'center',
          }
        ]
      ]).fontSize(10).widths([100, 70, 70, 70,]).margin([0,0, 0, 0]).end
    );
    pdf.add(
      new Txt('Comentarios Contador:').fontSize(13).bold().alignment('left').margin([0,10, 0, 0]).end
    )
    pdf.add(
      new Txt(this.dataInicial[0].ComentariosContador).fontSize(10).alignment('left').margin([0,2, 0, 2]).end
    )
    pdf.add(
      new Table([
        [
          {
            border: [true, true, true, true],
            text: 'Declaro que la totalidad de los gastos incluidos en este reporte no fueron recibidos a título de contraprestación de servicio; por lo tanto, no constituyen salario',
            alignment: 'left',
            fontSize: 8
          }, 
        ]
      ]).widths([520]).margin([0,3, 0, 2]).end
    );
    pdf.add(
      new Table([
        [
          {
            border: [true, true, false, false],
            text: this.dataInicial[0].Solicitante.Title,
            alignment: 'center',
            fontSize: 9
          },
          {
            border: [true, true, true, false],
            text: this.arrayAprobadores[0].Director.Title,
            alignment: 'center',
            fontSize: 9
          }
        ]
      ]).widths([256, 255]).margin([0,3, 0, 0]).end
    );
    pdf.add(
      new Table([
        [
          firmaSolicitante, firmaDirector
        ]
      ]).widths([256, 255]).margin([0,0, 0, 0]).end
    );
    pdf.add(
      new Table([
        [
          {
            border: [true, false, false, true],
            text: 'Responsable del anticipo o reintegro',
            alignment: 'center',
            fontSize: 9
          },
          {
            border: [true, false, true, true],
            text: 'Autoriza',
            alignment: 'center',
            fontSize: 9
          }
        ]
      ]).widths([256, 255]).margin([0,0, 0, 0]).end
    );
    // pdf.footer(
    //   new Table([
    //     [
    //       'Esto es un footer'
    //     ]
    //   ])
    // )

    pdf.pageSize("legal");
    pdf.pageMargins([40, 15, 40, 5]);
    pdf.pageOrientation('portrait');
    pdf.create().open()
  }


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

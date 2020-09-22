import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarAnticiposComponent } from './consultar-anticipos.component';

describe('ConsultarAnticiposComponent', () => {
  let component: ConsultarAnticiposComponent;
  let fixture: ComponentFixture<ConsultarAnticiposComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultarAnticiposComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarAnticiposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

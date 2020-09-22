import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MisPendientesComponent } from './mis-pendientes.component';

describe('MisPendientesComponent', () => {
  let component: MisPendientesComponent;
  let fixture: ComponentFixture<MisPendientesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MisPendientesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MisPendientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

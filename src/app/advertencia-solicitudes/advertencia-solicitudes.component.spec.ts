import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertenciaSolicitudesComponent } from './advertencia-solicitudes.component';

describe('AdvertenciaSolicitudesComponent', () => {
  let component: AdvertenciaSolicitudesComponent;
  let fixture: ComponentFixture<AdvertenciaSolicitudesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvertenciaSolicitudesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvertenciaSolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MisSolicitudesComponent } from './mis-solicitudes.component';

describe('MisSolicitudesComponent', () => {
  let component: MisSolicitudesComponent;
  let fixture: ComponentFixture<MisSolicitudesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MisSolicitudesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MisSolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

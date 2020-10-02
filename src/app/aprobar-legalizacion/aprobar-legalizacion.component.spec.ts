import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobarLegalizacionComponent } from './aprobar-legalizacion.component';

describe('AprobarLegalizacionComponent', () => {
  let component: AprobarLegalizacionComponent;
  let fixture: ComponentFixture<AprobarLegalizacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprobarLegalizacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AprobarLegalizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

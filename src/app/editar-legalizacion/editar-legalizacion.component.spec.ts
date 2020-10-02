import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarLegalizacionComponent } from './editar-legalizacion.component';

describe('EditarLegalizacionComponent', () => {
  let component: EditarLegalizacionComponent;
  let fixture: ComponentFixture<EditarLegalizacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarLegalizacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarLegalizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalizarAnticipoComponent } from './legalizar-anticipo.component';

describe('LegalizarAnticipoComponent', () => {
  let component: LegalizarAnticipoComponent;
  let fixture: ComponentFixture<LegalizarAnticipoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegalizarAnticipoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalizarAnticipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

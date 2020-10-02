import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesembolsarAnticipoComponent } from './desembolsar-anticipo.component';

describe('DesembolsarAnticipoComponent', () => {
  let component: DesembolsarAnticipoComponent;
  let fixture: ComponentFixture<DesembolsarAnticipoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesembolsarAnticipoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesembolsarAnticipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

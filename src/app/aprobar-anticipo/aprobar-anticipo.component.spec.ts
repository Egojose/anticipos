import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobarAnticipoComponent } from './aprobar-anticipo.component';

describe('AprobarAnticipoComponent', () => {
  let component: AprobarAnticipoComponent;
  let fixture: ComponentFixture<AprobarAnticipoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprobarAnticipoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AprobarAnticipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

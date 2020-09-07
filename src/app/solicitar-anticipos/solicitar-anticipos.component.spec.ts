import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarAnticiposComponent } from './solicitar-anticipos.component';

describe('SolicitarAnticiposComponent', () => {
  let component: SolicitarAnticiposComponent;
  let fixture: ComponentFixture<SolicitarAnticiposComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitarAnticiposComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitarAnticiposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

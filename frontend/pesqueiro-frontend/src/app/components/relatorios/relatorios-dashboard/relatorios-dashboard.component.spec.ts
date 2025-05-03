import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatoriosDashboardComponent } from './relatorios-dashboard.component';

describe('RelatoriosDashboardComponent', () => {
  let component: RelatoriosDashboardComponent;
  let fixture: ComponentFixture<RelatoriosDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatoriosDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatoriosDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

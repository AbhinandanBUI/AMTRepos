import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FillTimeSheetComponent } from './fill-time-sheet.component';

describe('FillTimeSheetComponent', () => {
  let component: FillTimeSheetComponent;
  let fixture: ComponentFixture<FillTimeSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FillTimeSheetComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FillTimeSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

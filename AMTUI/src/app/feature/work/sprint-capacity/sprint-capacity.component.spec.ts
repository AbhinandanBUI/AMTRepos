import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SprintCapacityComponent } from './sprint-capacity.component';

describe('SprintCapacityComponent', () => {
  let component: SprintCapacityComponent;
  let fixture: ComponentFixture<SprintCapacityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SprintCapacityComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SprintCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

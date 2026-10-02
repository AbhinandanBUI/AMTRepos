import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateDevelopmentStateComponent } from './create-development-state.component';

describe('CreateDevelopmentStateComponent', () => {
  let component: CreateDevelopmentStateComponent;
  let fixture: ComponentFixture<CreateDevelopmentStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateDevelopmentStateComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CreateDevelopmentStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

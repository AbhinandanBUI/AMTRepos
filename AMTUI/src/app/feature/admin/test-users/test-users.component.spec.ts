import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { APIResponse } from '../../../core/app-type-defination';
import { MasterAPIService } from '../../../services/master-api.service';
import { TestUsersComponent } from './test-users.component';
import { ToastService } from '../../../services/toast.service';

describe('TestUsersComponent', () => {
  let component: TestUsersComponent;
  let fixture: ComponentFixture<TestUsersComponent>;
  let api: jasmine.SpyObj<MasterAPIService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<MasterAPIService>('MasterAPIService', ['post']);
    api.post.and.returnValue(of({
      data: {
        user: {
          _id: 'test-user-id',
          fullName: 'Taylor Example',
          email: 'taylor@example.test',
          role: 'Developer',
        },
      },
    } as APIResponse));
    const toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [TestUsersComponent],
      providers: [
        { provide: MasterAPIService, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates a test user through the API and shows the result', () => {
    component.form.firstName = 'Taylor';
    component.form.lastName = 'Example';
    component.form.email = 'taylor@example.test';
    component.form.password = '123456';
    component.form.role = 'Developer';

    component.createTestUser();

    expect(api.post).toHaveBeenCalled();
    expect(component.users[0].email).toBe('taylor@example.test');
    expect(component.users[0].fullName).toBe('Taylor Example');
    expect(component.form.password).toBe('');
  });
});
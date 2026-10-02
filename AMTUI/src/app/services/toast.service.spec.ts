import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('adds typed success notifications', () => {
    service.success('Project created.', 'Saved');

    expect(service.messages()).toEqual([
      jasmine.objectContaining({ level: 'success', title: 'Saved', message: 'Project created.' }),
    ]);
    service.dismiss(service.messages()[0].id);
  });

  it('dismisses a notification by id', () => {
    service.error('Request failed.');
    const toastId = service.messages()[0].id;

    service.dismiss(toastId);

    expect(service.messages()).toEqual([]);
  });
});

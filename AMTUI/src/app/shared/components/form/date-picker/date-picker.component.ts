
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import flatpickr from 'flatpickr';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [LabelComponent],
  templateUrl: './date-picker.component.html',
  styles: ``
})
export class DatePickerComponent {

  @Input() id!: string;
  @Input() mode: 'single' | 'multiple' | 'range' | 'time' = 'single';
  @Input() defaultDate?: string | Date | string[] | Date[];
  @Input() minDate?: string | Date;
  @Input() label?: string;
  @Input() placeholder?: string;
  @Output() dateChange = new EventEmitter<any>();

  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;

  private flatpickrInstance: flatpickr.Instance | undefined;

  ngAfterViewInit() {
    this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, {
      mode: this.mode,
      static: true,
      monthSelectorType: 'static',
      dateFormat: 'Y-m-d',
      defaultDate: this.defaultDate,
      minDate: this.minDate,
      onChange: (selectedDates, dateStr, instance) => {
        this.dateChange.emit({ selectedDates, dateStr, instance });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.flatpickrInstance) return;
    if (changes['minDate'] && !changes['minDate'].isFirstChange()) {
      this.flatpickrInstance.set('minDate', this.minDate);
    }
    if (changes['defaultDate'] && !changes['defaultDate'].isFirstChange()) {
      this.flatpickrInstance.setDate(this.defaultDate as any, false);
    }
  }

  ngOnDestroy() {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }
}

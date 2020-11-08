import { AbstractControl } from '@angular/forms';

export function qtValidator(maxQt: number): any {
    return (control: AbstractControl): any => {
      const val: number = control.value;
      console.log('valor: ' + val);
      console.log('maxQt: ' + maxQt);
      if (val > maxQt) { return { qtValidator: true }; }
      return null;
    };
}

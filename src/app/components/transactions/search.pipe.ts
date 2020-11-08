import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'textFilter'
})
export class SearchPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!args) {
      return value;
    }
    return value.filter((val) => {
      // console.log('val', args);
      // const rVal = (val.id.toLocaleLowerCase().includes(args)) || (val.merchant.name.toLocaleLowerCase().includes(args));
      const rVal = (val.merchant.name.toLocaleLowerCase().includes(args));
      return rVal;
    });
  }
}

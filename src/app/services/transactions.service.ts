import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(private http: HttpClient) {
    /*this.getItems().subscribe(data => {
      console.log(data);
    });*/
  }

  public getItems(): Observable<any> {
    return this.http.get('./assets/data/transactions.json')
    .pipe(
      map(
        (resp: any) => {
          return resp.data;
        }
      )
    )
    ;
  }
}

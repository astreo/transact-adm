import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Item } from '../../models/transaction';
import { TransactionsService } from '../../services/transactions.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {

  loading: boolean;
  transactionList = {} as Item[];
  transactionList$: Observable<Item[]>;
  listSubscription = new Subscription();

  searchText = '';

  isDesc = false;
  column = 'Date';


  constructor(private transactionService: TransactionsService) { }

  ngOnInit(): void {
    // this.searchText.setValue('t');
    this.getList();
  }

  ngOnDestroy(): void {
    this.listSubscription.unsubscribe();
  }

  /*getList(): void {
    this.loading = true;
    this.listSubscription = this.transactionService.getItems().subscribe(result => {
      this.loading = false;
      this.transactionList = result;
      this.transactionList$ = this.textFilter.valueChanges.pipe(
        startWith(''),
        map(text => this.searchText(text))
      );
    });
  }*/

  getList(): void {
    this.transactionService.getItems().subscribe(result => {
      this.transactionList = result;
      console.log('transacciones:', this.transactionList);
      const date = new Date(this.transactionList[0].dates.valueDate);
      console.log('mes:', date.toDateString());
      console.log('mes:', date.getMonth() + 1);
      console.log('mes:', date.getDate());

    });
  }

  sort(property: string): void {
    let previous: boolean;
    let next: boolean;
    this.isDesc = !this.isDesc;
    this.column = property;
    const direction = this.isDesc ? 1 : -1;

    this.transactionList.sort((a, b) => {
      console.log('la Propieddad:', property);
      console.log('la a:', a);
      console.log('propiedad:', a['merchant.name']);

      switch (property) {
        case 'date':
          console.log('fecha1', new Date(a.dates.valueDate));
          console.log('fecha1', (a.dates.valueDate));
          console.log('fecha2', new Date(b.dates.valueDate));
          console.log('fecha2', (b.dates.valueDate));
          previous = new Date(a.dates.valueDate) < new Date(b.dates.valueDate);
          next = new Date(a.dates.valueDate) > new Date(b.dates.valueDate);
          break;
        case 'beneficiary':
          previous = a.merchant.name < b.merchant.name;
          next = a.merchant.name > b.merchant.name;
          break;
        case 'amount':
          const signA = (a.transaction.creditDebitIndicator === 'DBIT' ? '-' : '');
          const signB = (b.transaction.creditDebitIndicator === 'DBIT' ? '-' : '');
          previous = +(signA + a.transaction.amountCurrency.amount) < +(signB + b.transaction.amountCurrency.amount);
          next = +(signA + a.transaction.amountCurrency.amount) > +(signB + b.transaction.amountCurrency.amount);
          break;
        default:
          break;
      }

      if (previous) {
        return -1 * direction;
      }
      else if (next) {
        return 1 * direction;
      }
      else {
        return 0;
      }
    });
  }

}

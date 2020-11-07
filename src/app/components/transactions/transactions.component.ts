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

  textFilter = new FormControl('');

  constructor(private transactionService: TransactionsService) { }

  ngOnInit(): void {
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

}

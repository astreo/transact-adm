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
      console.log('categ:', this.transactionList[0].categoryCode);

    });
  }

}

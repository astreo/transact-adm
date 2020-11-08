import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Item } from '../../models/transaction';
import { TransactionsService } from '../../services/transactions.service';

declare interface ItemVM {
  fromAccount: string;
  toAccount: string;
  amount: string;
}

declare class MyFormDataStructure {
  fields: ItemVM;
  controls: {
    fromAccount: AbstractControl;
    toAccount: AbstractControl;
    amount: AbstractControl;
  };
}

declare interface MyForm extends FormGroup {
  value: MyFormDataStructure['fields'];
  controls: MyFormDataStructure['controls'];
}


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

  form: MyForm;
  fromAccountTxt = 'Free Checking(4692) - $';

  searchText = '';
  btnTxt = 'SUBMIT';
  limit = 500;
  maxQt: number;

  balance = 0;

  isDesc = false;
  column = 'Date';


  constructor(private transactionService: TransactionsService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      fromAccount: [this.fromAccountTxt, Validators.required],
      toAccount: ['', Validators.required],
      amount: ['', [Validators.required]],
    }) as MyForm;

    this.getList();
  }

  // tslint:disable-next-line: typedef
  get ctrls() {
    return this.form.controls;
  }

  isInvalid(ctrl: AbstractControl): boolean {
    return (ctrl.touched && ctrl.invalid);
  }

  getErrorMessage(fc: FormControl): string {
    let resp = '';
    resp += fc.hasError('required') ? 'Debe ingresar un valor. ' : '';
    resp += fc.hasError('minlength') ? 'Debe ingresar mínimo 6 dígitos. ' : '';
    resp += fc.hasError('equalValidator') ? 'Los valores no coinciden ' : '';
    resp += fc.hasError('max') ? 'You cannot overdraft your account beyond a balance of $ -' + this.limit : '';
    return resp;
  }

  ngOnDestroy(): void {
    this.listSubscription.unsubscribe();
  }

  getList(): void {
    this.transactionService.getItems().subscribe(result => {
      this.transactionList = result;
      console.log('transacciones:', this.transactionList);
      const date = new Date(this.transactionList[0].dates.valueDate);
      console.log('mes:', date.toDateString());
      console.log('mes:', date.getMonth() + 1);
      console.log('mes:', date.getDate());
      this.getInitialBalance();
      this.ctrls.fromAccount.setValue(this.fromAccountTxt + this.balance.toString());
      this.maxQt = this.balance - this.limit;
      this.ctrls.amount.setValidators([Validators.max(this.maxQt)]);
      console.log('maximo establecido:', this.maxQt);
    });
  }

  getInitialBalance(): void {
    this.transactionList.forEach(item => {
      if (item.transaction.creditDebitIndicator === 'CRDT') {
        this.balance = this.balance + (+item.transaction.amountCurrency.amount);
      } else {
        this.balance = this.balance - (+item.transaction.amountCurrency.amount);
      }
    });
    console.log('balance inicial: ', this.balance);
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

  ok(): void {
    if (this.btnTxt === 'SUBMIT') {
      this.btnTxt = 'TRANSFER';
    } else {
      this.btnTxt = 'SUBMIT';
    }
  }

  cancel(): void {
    this.btnTxt = 'SUBMIT';
  }

}

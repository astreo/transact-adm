import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Item, Transaction, Merchant, AmountCurrency, Dates } from '../../models/transaction';
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
      fromAccount: [{ value: this.fromAccountTxt/*, disabled: true*/ }],
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
      this.maxQt = this.balance + this.limit;
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
    this.balance = +(this.balance.toFixed(2));
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

  transfer(): void {
    const newTransf = {} as Item;
    newTransf.dates = {} as Dates;
    newTransf.transaction = {} as Transaction;
    newTransf.transaction.amountCurrency = {} as AmountCurrency;
    newTransf.merchant = {} as Merchant;

    // tslint:disable-next-line: no-bitwise
    newTransf.categoryCode = '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
    newTransf.dates.valueDate = +(new Date());
    newTransf.merchant.name = this.ctrls.toAccount.value;
    newTransf.merchant.accountNumber = 'SI64397745065188826';
    newTransf.transaction.amountCurrency.amount = this.ctrls.amount.value;
    newTransf.transaction.amountCurrency.currencyCode = 'EUR';
    newTransf.transaction.creditDebitIndicator = 'DBIT';

    this.transactionList.push(newTransf);

    this.balance = this.balance - this.ctrls.amount.value;
    this.balance =  +(this.balance.toFixed(2));
    this.ctrls.fromAccount.setValue(this.fromAccountTxt + this.balance.toString());
    this.maxQt = this.balance + this.limit;
    this.ctrls.amount.setValidators([Validators.max(this.maxQt)]);
  }

  ok(): void {
    if (this.btnTxt === 'SUBMIT') {
      this.btnTxt = 'TRANSFER';
      this.ctrls.toAccount.disable();
      this.ctrls.amount.disable();
    } else {
      this.transfer();
      this.btnTxt = 'SUBMIT';
      this.ctrls.toAccount.enable();
      this.ctrls.amount.enable();
      this.ctrls.toAccount.setValue('');
      this.ctrls.amount.setValue('');
    }
  }

  cancel(): void {
    this.btnTxt = 'SUBMIT';
    this.ctrls.toAccount.enable();
    this.ctrls.amount.enable();
  }


}

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankService, Transaction, Account } from '../../../core/services/bank.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-transactions-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-3xl font-display font-black text-slate-900 tracking-tight">Historique</h2>
          <p class="text-slate-500 mt-1">Consultez et analysez vos opérations bancaires récentes.</p>
        </div>
        <div class="flex flex-wrap items-center gap-4 px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Du</span>
            <input type="date" [(ngModel)]="dateFilters.start" class="text-sm font-bold text-slate-900 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 py-1" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Au</span>
            <input type="date" [(ngModel)]="dateFilters.end" class="text-sm font-bold text-slate-900 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 py-1" />
          </div>
          <button (click)="applyFilters()" class="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-colors">
            Filtrer
          </button>
          <button (click)="downloadPDF()" class="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Relevé (PDF)
          </button>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl">
        <div *ngIf="loading" class="flex flex-col h-80 items-center justify-center space-y-4">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg shadow-blue-100"></div>
          <p class="text-slate-400 text-sm font-medium animate-pulse">Chargement de vos transactions...</p>
        </div>

        <div *ngIf="!loading && transactions.length === 0" class="p-20 text-center flex flex-col items-center justify-center">
          <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 uppercase tracking-tighter">Aucune opération</h3>
          <p class="text-slate-400 text-sm mt-1 max-w-xs">Vos transactions apparaîtront ici dès que vous aurez effectué votre première opération.</p>
        </div>

        <div *ngIf="!loading && transactions.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100">
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Heure</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Désignation</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Référence</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let tx of transactions" class="hover:bg-slate-50/80 transition-all group">
                <td class="px-8 py-6">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-900 leading-none mb-1">{{ tx.transactionDate | date:'dd MMM yyyy' }}</span>
                    <span class="text-[11px] text-slate-400 font-medium">{{ tx.transactionDate | date:'HH:mm' }}</span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="flex items-center gap-3">
                    <div [class]="tx.transactionType === 'WITHDRAWAL' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'" class="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                       <svg *ngIf="tx.transactionType === 'WITHDRAWAL'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                       </svg>
                       <svg *ngIf="tx.transactionType !== 'WITHDRAWAL'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                       </svg>
                    </div>
                    <span class="font-bold text-slate-800 text-sm italic">{{ tx.description || (tx.transactionType === 'TRANSFER' ? 'Virement' : 'Opération') }}</span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-tighter">
                    ...{{ tx.sourceAccount.accountNumber.slice(-4) }}
                  </span>
                </td>
                <td class="px-8 py-6">
                  <span [ngClass]="{
                    'bg-green-100 text-green-700 shadow-sm shadow-green-100': tx.transactionType === 'DEPOSIT',
                    'bg-rose-100 text-rose-700 shadow-sm shadow-rose-100': tx.transactionType === 'WITHDRAWAL',
                    'bg-indigo-100 text-indigo-700 shadow-sm shadow-indigo-100': tx.transactionType === 'TRANSFER'
                  }" class="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    {{ tx.transactionType }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right font-black transition-all group-hover:pr-10" [ngClass]="tx.transactionType === 'WITHDRAWAL' ? 'text-rose-600' : 'text-emerald-600'">
                  <div class="flex items-center justify-end gap-1">
                    <span class="text-xs">{{ tx.transactionType === 'WITHDRAWAL' ? '-' : '+' }}</span>
                    <span class="text-lg">{{ tx.amount | number:'1.2-2' }}</span>
                    <span class="text-[10px] text-slate-400 font-bold ml-1 uppercase">FCFA</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TransactionsHistoryComponent implements OnInit {
  private bankService = inject(BankService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  transactions: Transaction[] = [];
  loading = true;
  dateFilters = {
    start: '',
    end: new Date().toISOString().split('T')[0]
  };

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.fetchTransactions(userId);
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  applyFilters(): void {
    const userId = this.authService.getUserId();
    if (userId) this.fetchTransactions(userId);
  }

  fetchTransactions(userId: number): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.bankService.getAccountsByClient(userId).subscribe({
      next: (accounts: Account[]) => {
        if (accounts.length === 0) {
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const txRequests = accounts.map(acc => {
          if (this.dateFilters.start && this.dateFilters.end) {
            // Convert to matching format YYYY-MM-DDTHH:mm:ss if backend requires it
            const start = `${this.dateFilters.start}T00:00:00`;
            const end = `${this.dateFilters.end}T23:59:59`;
            return this.bankService.getTransactionsByAccountAndPeriod(acc.id, start, end);
          }
          return this.bankService.getTransactionsByAccount(acc.id);
        });

        forkJoin(txRequests).pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        ).subscribe({
          next: (results) => {
            const allTx = results.flat();
            this.transactions = allTx.sort((a, b) => {
              const dateA = new Date(a.transactionDate || a.createdAt || '').getTime();
              const dateB = new Date(b.transactionDate || b.createdAt || '').getTime();
              return dateB - dateA;
            });
          },
          error: (err: any) => console.error('Error fetching transactions', err)
        });
      },
      error: (err: any) => {
        console.error('Error fetching accounts for transactions', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  downloadPDF(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    // For simplicity, we download the statement of the first account. 
    // Ideally, we'd have a dropdown to choose the account.
    this.bankService.getAccountsByClient(userId).subscribe(accounts => {
      if (accounts.length > 0) {
        const primaryAcc = accounts[0];
        const request = (this.dateFilters.start && this.dateFilters.end)
          ? this.bankService.getAccountStatementByPeriod(primaryAcc.id, `${this.dateFilters.start}T00:00:00`, `${this.dateFilters.end}T23:59:59`)
          : this.bankService.getAccountStatement(primaryAcc.id);

        request.subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `releve-compte-${primaryAcc.accountNumber}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (err) => console.error('Error downloading PDF', err)
        });
      }
    });
  }
}

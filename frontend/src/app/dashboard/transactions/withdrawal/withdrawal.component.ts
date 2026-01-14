import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BankService, Account } from '../../../core/services/bank.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-client-withdrawal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-8">
      <div class="space-y-2">
        <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Faire un retrait</h2>
        <p class="text-slate-500">Retirez des fonds de l'un de vos comptes.</p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div class="p-8">
          <div class="space-y-6">
            <!-- Account Selection -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Sélectionnez le compte</label>
              <select
                [(ngModel)]="withdrawalData.accountId"
                class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              >
                <option [ngValue]="null" disabled>Choisissez un compte</option>
                <option *ngFor="let acc of myAccounts" [ngValue]="acc.id">
                  {{ acc.accountType === 'EPARGNE' ? 'Epargne' : 'Courant' }} - {{ acc.accountNumber }} ({{ acc.balance | number:'1.2-2' }} FCFA)
                </option>
              </select>
            </div>

            <!-- Amount -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Montant à retirer (FCFA)</label>
              <div class="relative group">
                <input
                  type="number"
                  [(ngModel)]="withdrawalData.amount"
                  placeholder="0.00"
                  class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <span class="font-bold">₵</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Libellé (Optionnel)</label>
              <input
                type="text"
                [(ngModel)]="withdrawalData.description"
                placeholder="Ex: Retrait guichet"
                class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <button
              (click)="onSubmit()"
              [disabled]="submitting || !withdrawalData.accountId || !withdrawalData.amount"
              class="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-1"
            >
              <span *ngIf="!submitting">Confirmer le Retrait</span>
              <span *ngIf="submitting">Traitement...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Warning Card -->
      <div class="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start space-x-4">
        <div class="bg-amber-100 p-2 rounded-lg shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-amber-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div class="space-y-1">
          <h4 class="text-sm font-bold text-amber-900 uppercase tracking-tight">Attention</h4>
          <p class="text-sm text-amber-700/80 leading-relaxed">
            Un retrait ne peut être effectué que si le solde de votre compte est suffisant.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ClientWithdrawalComponent implements OnInit {
  private bankService = inject(BankService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  myAccounts: Account[] = [];
  submitting = false;
  withdrawalData = {
    accountId: null as number | null,
    amount: null as number | null,
    description: 'Retrait personnel'
  };

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadMyAccounts(userId);
    }
  }

  loadMyAccounts(userId: number): void {
    this.bankService.getAccountsByClient(userId).subscribe({
      next: (accounts) => {
        this.myAccounts = accounts;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading accounts', err)
    });
  }

  onSubmit(): void {
    if (!this.withdrawalData.accountId || !this.withdrawalData.amount || this.withdrawalData.amount <= 0) {
      this.notificationService.warning('Veuillez remplir tous les champs correctement.');
      return;
    }

    // Client-side balance check
    const selectedAcc = this.myAccounts.find(a => a.id === this.withdrawalData.accountId);
    if (selectedAcc && selectedAcc.balance < this.withdrawalData.amount) {
      this.notificationService.error('Solde insuffisant pour effectuer ce retrait.');
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    const transaction = {
      amount: this.withdrawalData.amount,
      transactionType: 'WITHDRAWAL',
      description: this.withdrawalData.description,
      sourceAccount: { id: this.withdrawalData.accountId },
      transactionDate: new Date().toISOString()
    };

    this.bankService.createTransaction(transaction).pipe(
      finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.notificationService.success('Retrait effectué avec succès !');
        this.router.navigate(['/dashboard/transactions']);
      },
      error: (err) => {
        console.error('Withdrawal error', err);
        const msg = err.status === 403 ? 'Solde insuffisant.' : 'Erreur lors du retrait.';
        this.notificationService.error(msg);
      }
    });
  }
}

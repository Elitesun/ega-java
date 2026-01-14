import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BankService, Account } from '../../../core/services/bank.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-8">
      <div class="space-y-2">
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Faire un Dépôt</h2>
        <p class="text-slate-500">Ajoutez des fonds sur l'un de vos comptes.</p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div class="p-8">
          <form [formGroup]="depositForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Account Selection -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Compte bénéficiaire</label>
              <div class="relative">
                <select
                  formControlName="accountId"
                  class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="">Sélectionnez un compte</option>
                  <option *ngFor="let acc of accounts" [value]="acc.id">
                    {{ acc.accountType === 'EPARGNE' ? 'Epargne' : 'Courant' }} - {{ acc.accountNumber }} - Solde : {{ acc.balance | number:'1.2-2' }} FCFA
                  </option>
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
              <p *ngIf="depositForm.get('accountId')?.touched && depositForm.get('accountId')?.invalid" class="text-xs font-medium text-red-500 mt-1 pl-1">
                Veuillez sélectionner un compte.
              </p>
            </div>

            <!-- Amount -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Montant (FCFA)</label>
              <div class="relative group">
                <input
                  type="number"
                  formControlName="amount"
                  placeholder="0.00"
                  class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <span class="font-bold">₵</span>
                </div>
              </div>
              <p *ngIf="depositForm.get('amount')?.touched && depositForm.get('amount')?.invalid" class="text-xs font-medium text-red-500 mt-1 pl-1">
                Le montant doit être supérieur à 0.
              </p>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Libellé / Motif</label>
              <input
                type="text"
                formControlName="description"
                placeholder="Ex: Dépôt personnel"
                class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              [disabled]="submitting || depositForm.invalid"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-xl flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-1"
            >
              <span *ngIf="!submitting">Confirmer le Dépôt</span>
              <span *ngIf="submitting" class="animate-pulse">Traitement...</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Info Card -->
      <div class="bg-blue-50 border-blue-100 text-blue-900 border rounded-2xl p-6 flex items-start space-x-4">
        <div class="bg-blue-100 text-blue-600 p-2 rounded-lg shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <div class="space-y-1">
          <h4 class="text-sm font-bold uppercase tracking-tight">Note Importante</h4>
          <p class="text-sm opacity-80 leading-relaxed">
            Le dépôt sera effectif sur votre compte après validation par le système.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DepositComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  depositForm: FormGroup;
  accounts: Account[] = [];
  submitting = false;

  constructor() {
    this.depositForm = this.fb.group({
      accountId: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      description: ['Dépôt personnel', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.bankService.getAccountsByClient(userId).subscribe({
      next: (data) => {
        this.accounts = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading accounts', err)
    });
  }

  onSubmit(): void {
    if (this.depositForm.invalid) return;

    this.submitting = true;
    this.cdr.detectChanges();

    const { accountId, amount, description } = this.depositForm.value;

    const transaction = {
      amount,
      transactionType: 'CREDIT',
      description,
      sourceAccount: { id: parseInt(accountId) },
      transactionDate: new Date().toISOString()
    };

    this.bankService.createTransaction(transaction).pipe(
      finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.notificationService.success('Dépôt effectué avec succès !');
        this.router.navigate(['/dashboard/transactions']);
      },
      error: (err) => {
        console.error('Deposit error', err);
        this.notificationService.error('Erreur lors du dépôt.');
      }
    });
  }
}

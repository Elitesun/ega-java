import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BankService } from '../../../core/services/bank.service';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-edit-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-8">
      <div class="space-y-2">
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Modifier le Compte</h2>
        <p class="text-slate-500">Mettez à jour le type ou le solde du compte.</p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div class="p-8">
          <form [formGroup]="accountForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Account Number (Read Only) -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Numéro de Compte</label>
              <input type="text" formControlName="accountNumber" readonly class="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none cursor-not-allowed text-slate-500" />
            </div>

            <!-- Owner (Read Only) -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Propriétaire</label>
              <input type="text" formControlName="ownerName" readonly class="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none cursor-not-allowed text-slate-500" />
            </div>

            <!-- Account Type -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Type de Compte</label>
              <select formControlName="accountType" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                <option value="COURANT">Compte Courant</option>
                <option value="EPARGNE">Compte Épargne</option>
              </select>
            </div>

            <!-- Balance -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Solde (FCFA)</label>
              <input type="number" formControlName="balance" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="button"
                (click)="onCancel()"
                class="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="accountForm.invalid || submitting"
                class="flex-auto px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl"
              >
                {{ submitting ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminEditAccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  accountForm: FormGroup;
  submitting = false;
  accountId!: number;

  constructor() {
    this.accountForm = this.fb.group({
      accountNumber: [{ value: '', disabled: true }],
      ownerName: [{ value: '', disabled: true }],
      accountType: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.accountId = +id;
      this.loadAccount();
    }
  }

  loadAccount(): void {
    this.bankService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.accountForm.patchValue({
          accountNumber: account.accountNumber,
          ownerName: `${account.owner?.firstName} ${account.owner?.lastName}`,
          accountType: account.accountType,
          balance: account.balance
        });
      },
      error: (err) => {
        console.error('Error loading account', err);
        this.notificationService.error('Erreur lors du chargement du compte.');
        this.router.navigate(['/dashboard/admin/accounts']);
      }
    });
  }

  onSubmit(): void {
    if (this.accountForm.invalid) return;

    this.submitting = true;
    const { accountType, balance } = this.accountForm.getRawValue();

    this.bankService.updateAccount(this.accountId, { accountType, balance }).pipe(
      finalize(() => this.submitting = false)
    ).subscribe({
      next: () => {
        this.notificationService.success('Compte mis à jour avec succès.');
        this.router.navigate(['/dashboard/admin/accounts']);
      },
      error: (err) => {
        console.error('Error updating account', err);
        this.notificationService.error('Erreur lors de la mise à jour.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/admin/accounts']);
  }
}

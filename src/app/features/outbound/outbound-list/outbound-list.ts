import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { RouterLink } from "@angular/router";

import { CampaignsApiService } from '../../../core/services/campaigns-api';
import { Auth } from '../../../core/services/auth';
import { ICampaign } from '../../../core/models/campaign';

@Component({
  selector: 'app-outbound-list',
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    CommonModule,
    InputTextModule,
    TooltipModule,
    MenuModule,
    RouterLink
  ],
  templateUrl: './outbound-list.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class OutboundList implements OnInit {
  private readonly campaignsApi = inject(CampaignsApiService);
  private readonly auth = inject(Auth);

  campaigns = signal<ICampaign[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);
  selectedCampaigns = signal<ICampaign[]>([]);

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  first = signal<number>(0);

  menuItems: MenuItem[] = [];
  selectedCampaign: ICampaign | null = null;

  companyId = computed(() => this.auth.currentUser()?.company_id);

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    const companyId = this.companyId();
    if (!companyId) {
      console.error('No company ID found');
      return;
    }

    this.loading.set(true);
    this.campaignsApi.getCampaigns(companyId, this.currentPage(), this.pageSize(), 'outbound')
      .subscribe({
        next: (response) => {
          this.campaigns.set(response.results);
          this.totalRecords.set(response.count);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading campaigns:', error);
          this.loading.set(false);
        }
      });
  }

  pageChange(event: any): void {
    this.first.set(event.first);
    this.pageSize.set(event.rows);
    this.currentPage.set(Math.floor(event.first / event.rows) + 1);
    this.loadCampaigns();
  }

  showMenu(event: Event, campaign: ICampaign, menu: Menu): void {
    this.selectedCampaign = campaign;
    this.menuItems = [
      {
        label: 'Edit',
        icon: 'fa-regular fa-pen-to-square',
        command: () => this.editCampaign(campaign),
      },
      {
        label: 'Delete',
        icon: 'fa-regular fa-trash-can',
        styleClass: 'text-red-500',
        command: () => this.deleteCampaign(campaign),
      },
    ];
    menu.toggle(event);
  }

  editCampaign(campaign: ICampaign): void {
    console.log('Editing campaign:', campaign);
    // Navigate to edit page or open edit dialog
  }

  deleteCampaign(campaign: ICampaign): void {
    const companyId = this.companyId();
    if (!companyId) return;

    if (confirm(`Are you sure you want to delete the campaign "${campaign.name}"?`)) {
      this.campaignsApi.deleteCampaign(companyId, campaign.id)
        .subscribe({
          next: () => {
            this.loadCampaigns();
          },
          error: (error) => {
            console.error('Error deleting campaign:', error);
          }
        });
    }
  }

  getSequenceCount(campaign: ICampaign): number {
    return campaign.sequences?.length || 0;
  }

  getSources(campaign: ICampaign): string {
    if (!campaign.sources || campaign.sources.length === 0) {
      return 'N/A';
    }
    return campaign.sources.join(', ');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-error';
  }
}

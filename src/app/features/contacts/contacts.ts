import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Menu } from 'primeng/menu';

import { ContactForm } from './contact-form/contact-form';
import { ContactsApi } from '../../core/services/contacts-api';
import { Contact } from '../../core/models/contact';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-contacts',
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    CommonModule,
    InputTextModule,
    TooltipModule,
    MenuModule,
    ConfirmDialogModule,
    ContactForm,
  ],
  templateUrl: './contacts.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class Contacts implements OnInit {
  private contactsApi = inject(ContactsApi);
  private auth = inject(Auth);
  private confirmationService = inject(ConfirmationService);

  // Signals
  contacts = signal<Contact[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  totalRecords = signal<number>(0);

  // Dialog and menu
  visible = signal<boolean>(false);
  menuItems: MenuItem[] = [];
  selectedContact = signal<Contact | null>(null);
  selectedContacts = signal<Contact[]>([]);

  // Pagination
  first = signal<number>(0);
  rows = signal<number>(10);
  currentPage = signal<number>(1);

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    const currentUser = this.auth.currentUser();

    if (!currentUser?.company_id) {
      this.error.set('No company ID found. Please ensure you are logged in.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.contactsApi
      .getContacts(currentUser.company_id, {
        page: this.currentPage(),
        page_size: this.rows(),
        company: currentUser.company_id,
      })
      .subscribe({
        next: (response) => {
          this.contacts.set(response.results);
          this.totalRecords.set(response.count);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load contacts. Please try again later.');
          this.isLoading.set(false);
          console.error('Error loading contacts:', err);
        },
      });
  }

  pageChange(event: any): void {
    this.first.set(event.first);
    this.rows.set(event.rows);
    this.currentPage.set(Math.floor(event.first / event.rows) + 1);
    this.loadContacts();
  }

  showMenu(event: Event, contact: Contact, menu: Menu): void {
    this.selectedContact.set(contact);
    this.menuItems = [
      {
        label: 'Edit',
        icon: 'fa-regular fa-pen-to-square',
        command: () => this.editContact(contact),
      },
      {
        label: 'Delete',
        icon: 'fa-regular fa-trash-can',
        styleClass: 'text-red-500',
        command: () => this.deleteContact(contact),
      },
    ];
    menu.toggle(event);
  }

  editContact(contact: Contact): void {
    this.selectedContact.set(contact);
    this.visible.set(true);
  }

  deleteContact(contact: Contact): void {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        const currentUser = this.auth.currentUser();

        if (!currentUser?.company_id) {
          console.error('No company ID found');
          return;
        }

        this.contactsApi.deleteContact(currentUser.company_id, contact.id).subscribe({
          next: () => {
            this.loadContacts();
          },
          error: (err) => {
            console.error('Error deleting contact:', err);
          },
        });
      },
    });
  }

  createContact(): void {
    this.selectedContact.set(null);
    this.visible.set(true);
  }

  onCancelForm(): void {
    this.visible.set(false);
    this.selectedContact.set(null);
  }

  onSubmitForm(contactData: any): void {
    const currentUser = this.auth.currentUser();

    if (!currentUser?.company_id) {
      console.error('No company ID found');
      return;
    }

    const selectedContact = this.selectedContact();

    const request$ = selectedContact
      ? this.contactsApi.updateContact(currentUser.company_id, selectedContact.id, contactData)
      : this.contactsApi.createContact(currentUser.company_id, contactData);

    request$.subscribe({
      next: () => {
        this.visible.set(false);
        this.selectedContact.set(null);
        this.loadContacts();
      },
      error: (err) => {
        console.error(`Error ${selectedContact ? 'updating' : 'creating'} contact:`, err);
      },
    });
  }
}

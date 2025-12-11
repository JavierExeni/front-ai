import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
})
export default class OutboundList {
 visible: boolean = false;
  menuItems: MenuItem[] = [];
  selectedContact: any = null;

  first = 0;

  rows = 10;

  products: any[] = [
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
  ];

  selectedProducts!: any;

  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  isLastPage(): boolean {
    return this.products ? this.first + this.rows >= this.products.length : true;
  }

  isFirstPage(): boolean {
    return this.products ? this.first === 0 : true;
  }

  showMenu(event: Event, contact: any, menu: Menu) {
    this.selectedContact = contact;
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

  editContact(contact: any) {
    console.log('Editing contact:', contact);
    // Aquí puedes agregar la lógica para editar
    this.visible = true;
  }

  deleteContact(contact: any) {
    console.log('Deleting contact:', contact);
    // Aquí puedes agregar la lógica para eliminar
    if (confirm('Are you sure you want to delete this contact?')) {
      const index = this.products.indexOf(contact);
      if (index > -1) {
        this.products.splice(index, 1);
      }
    }
  }
}

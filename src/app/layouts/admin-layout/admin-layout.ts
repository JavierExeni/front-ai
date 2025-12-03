import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeader } from "../../shared/components/admin-header/admin-header";
import { AdminSidebar } from "../../shared/components/admin-sidebar/admin-sidebar";

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminHeader, AdminSidebar],
  templateUrl: './admin-layout.html',
  styles: ``,
})
export class AdminLayout {}

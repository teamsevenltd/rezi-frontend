import { Component } from '@angular/core';
import { AppHeaderComponent } from "../../components/app-header/app-header.component";
import { AppSidebarComponent } from "../../components/app-sidebar/app-sidebar.component";
import { RouterOutlet } from '@angular/router';
import { AppfooterComponent } from "../../components/appfooter/appfooter.component";

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [AppHeaderComponent, AppSidebarComponent, RouterOutlet, AppfooterComponent],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {

}

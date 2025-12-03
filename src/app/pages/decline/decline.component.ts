import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-decline',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: './decline.component.html',
  styleUrl: './decline.component.scss'
})
export class DeclineComponent {

}

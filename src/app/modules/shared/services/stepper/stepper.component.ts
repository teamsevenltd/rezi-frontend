import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss'
})
export class StepperComponent {
  counter: any = 0;
  next() {
    if (this.counter < 4) {
      this.counter++;
    }
  }

  previous() {
    if (this.counter > 0) {
      this.counter--;
    }
  }
}

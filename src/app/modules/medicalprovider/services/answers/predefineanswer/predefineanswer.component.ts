import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-predefineanswer',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './predefineanswer.component.html',
  styleUrl: './predefineanswer.component.scss'
})
export class PredefineanswerComponent {
  paitentgroup:boolean=false;
  picturetype:boolean=false;
  stepbtn:boolean=false;
  steps:any[]=[];
  clickbtn(): void {
    this.steps.push({id: this.steps.length + 1 }); 
    if (!this.stepbtn) {
      this.stepbtn = true;
    }
  }
  clicktypeofanswer(event:any):void{
    if(event.target.value=== 'picture'){
this.picturetype=!this.picturetype;
    }
  }
  clickpaitentgroup(event:any):void{
    if (event.target.value === 'selectedpaitent') {
      this.paitentgroup = !this.paitentgroup;  
    }
    
  }

}

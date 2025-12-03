import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-subpredefineanswer',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './subpredefineanswer.component.html',
  styleUrl: './subpredefineanswer.component.scss'
})
export class SubpredefineanswerComponent {
  paitentgroup:boolean=false;
  squestion:boolean=false;
  mquestion:boolean=false;
  fdownload:boolean=false;
  stepbtn:boolean=false;
  steps:any[]=[];
  clickbtn(): void {
    this.steps.push({id: this.steps.length + 1 }); 
    if (!this.stepbtn) {
      this.stepbtn = true;
    }
  }
  clickpaitentgroup(event:any):void{
    if (event.target.value === 'selectedpaitent') {
      this.paitentgroup = !this.paitentgroup;  
    }
    
  }
  junctiontype(event:any):void{
    if(event.target.value === 'singlequestion'){
      this.squestion=!this.squestion;
    }
    else if(event.target.value === 'multiplequestion'){
      this.mquestion=!this.mquestion;
    }
    else  if(event.target.value === 'filedownload'){
      this.fdownload=!this.fdownload;
    }
  }
}

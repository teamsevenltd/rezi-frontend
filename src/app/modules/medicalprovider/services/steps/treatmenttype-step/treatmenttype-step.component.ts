import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../../auth/auth.service';
import { GeneralServiceService } from '../../../../../services/general-service.service';
import Swal from 'sweetalert2';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-treatmenttype-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterModule],
  // CdkDropList, CdkDrag
  templateUrl: './treatmenttype-step.component.html',
  styleUrl: './treatmenttype-step.component.scss'
})
export class TreatmenttypeStepComponent  {
  // implements OnInit
  @Input() step_details: any;

  // treatmentForm!: FormGroup;
  // getLoader = false;
  // treatments_arr: any = [];

  // constructor(private fb: FormBuilder, private auth: AuthService, private shared: GeneralServiceService) { }

  // ngOnInit(): void {
  //   this.treatmentForm = this.fb.group({
  //     id: [this.step_details?.step_meta?.step_id],
  //     action: [''],
  //     treatments: this.fb.array([])
  //   });
  //   this.treatmentForm.get('treatments')?.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(() => {
  //     this.updateTreatmentTitle();
  //   });
  //   if (this.step_details) {
  //     this.getTreatments();
  //   }
  // }

  // getTreatments() {
  //   // const array = this.treatmentForm.get('treatments') as FormArray;
  //   // this.step_details?.step_meta.treatments.forEach((treatment: any) => {
  //   //   const existingTreatment = array.controls.find((control: any) => {
  //   //     return control.value._id === treatment._id;
  //   //   });
  //   //   if (!existingTreatment) {
  //   //     array.push(this.fb.group({
  //   //       _id: [treatment?._id || ''],
  //   //       name: [treatment.name]
  //   //     }));
  //   //   }
  //   // });

  //   this.getLoader = true;
  //   this.auth.get('step/treatments/' + this.step_details.step_meta.step_id).subscribe({
  //     next: (res: any) => {
  //       if (res.status == 200) {
  //         this.getLoader = false;
  //         this.treatments_arr = res.data?.treatments;
  //         const treatmentArray = this.treatmentForm.get('treatments') as FormArray;
  //         treatmentArray.clear();
  //         this.treatments_arr.forEach((treatment: any) => {
  //           const existingTreatment = treatmentArray.controls.find((control: any) => {
  //             return control.value._id === treatment._id;
  //           });
  //           if (!existingTreatment) {
  //             treatmentArray.push(this.fb.group({
  //               _id: [treatment?._id || ''],
  //               name: [treatment.name]
  //             }));
  //           }
  //         });
  //       }
  //     },
  //     error: (err) => {
  //       this.getLoader = false;
  //     }
  //   })
  // }

  // get treatmentsArray(): FormArray {
  //   return this.treatmentForm.get('treatments') as FormArray;
  // }

  // createTreatments(): FormGroup {
  //   return this.fb.group({
  //     name: [''],
  //   });
  // }

  // addTreatments() {
  //   this.treatmentsArray.push(this.createTreatments());
  //   const array = this.treatmentForm.get('treatments') as FormArray;
  //   this.auth.post('step/treatments', { id: this.treatmentForm.value.id, order: array.value.length }).subscribe({
  //     next: (res: any) => {
  //       if (res.status == 200) {
  //         // this.shared.showAlert('success', 'Successful', res.message);
  //         this.getTreatments();
  //       }
  //     },
  //     error: (err) => {
  //       this.shared.showAlert('error', 'Error', err.error.message);
  //     }
  //   })
  // }

  // updateTreatmentTitle() {
  //   this.treatmentForm.patchValue({ action: 'ChangeName' })
  //   this.auth.patch('step/treatments', this.treatmentForm.value).subscribe({
  //     next: (res: any) => {
  //       if (res.status == 200) {
  //         this.shared.showAlert('success', 'Successful', res.message);
  //         // this.getTreatments();
  //       }
  //     },
  //     error: (err) => {
  //       this.shared.showAlert('error', 'Error', err.error.message);
  //     }
  //   })
  // }


  // deleteTreatment(index: number) {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: "This action can't be reverted",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#000000",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes, delete it!"
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.auth.delete('step/treatment', { id: this.step_details.step_meta.step_id, treatment_id: this.treatments_arr[index]?._id }).subscribe({
  //         next: (res: any) => {
  //           if (res.status == 200) {
  //             this.shared.showAlert('success', 'Successful', res.message);
  //             this.getTreatments();
  //           }
  //         },
  //         error: (err) => {
  //           this.shared.showAlert('error', 'Error', err.error.message);
  //         }
  //       })
  //     }
  //   });
  // }

  // drop(event: CdkDragDrop<string[]>) {
  //   if (this.treatments_arr[event.previousIndex]?._id == this.treatments_arr[event.currentIndex]?._id) {
  //     return
  //   }
  //   else {
  //     moveItemInArray(this.treatments_arr, event.previousIndex, event.currentIndex);
  //     const treatmentsArray = this.treatmentForm.get('treatments') as FormArray;
  //     treatmentsArray.clear();
  //     this.treatments_arr.forEach((treatment: any) => {
  //       treatmentsArray.push(this.fb.group({
  //         id: [treatment._id],
  //         // order: 
  //       }));
  //     });
  //     treatmentsArray.value
  //     // this.auth.post('step/treatments', this.treatmentForm.value).subscribe({
  //     //   next: (res: any) => {
  //     //     if (res.status == 200) {
  //     //       this.shared.showAlert('success', 'Successful', res.message);
  //     //       this.getTreatments();
  //     //     }
  //     //   },
  //     //   error: (err) => {
  //     //     this.shared.showAlert('error', 'Error', err.error.message);
  //     //   }
  //     // })
  //   }
  // }
}

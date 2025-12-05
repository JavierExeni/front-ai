import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { FormStepOne } from './form-step-one/form-step-one';
import { FormStepTwo } from './form-step-two/form-step-two';
import { FormStepThree } from './form-step-three/form-step-three';
import { FormStepFour } from './form-step-four/form-step-four';

@Component({
  selector: 'app-register',
  imports: [StepperModule, NgClass, FormStepOne, FormStepTwo, FormStepThree, FormStepFour],
  templateUrl: './register.html',
  styles: ``,
})
export default class Register {
  activeStep: number = 1;
}

import { Routes } from '@angular/router';
import { SettingComponent } from '../shared/setting/setting.component';
import { ServicesComponent } from './services/services.component';
import { LocationComponent } from './location/location.component';
import { StepsComponent } from './services/steps/steps.component';
import { AnswersComponent } from './services/answers/answers.component';
import { PredefineanswerComponent } from './services/answers/predefineanswer/predefineanswer.component';
import { SubpredefineanswerComponent } from './services/answers/predefineanswer/subpredefineanswer/subpredefineanswer.component';
import { ChatComponent } from './chat/chat.component';
import { ConfiguartionComponent } from '../shared/configuartion/configuartion.component';
import { CalendarComponent } from './calendar/calendar.component';
import { NewsComponent } from './news/news.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { PatientsComponent } from './patients/patients.component';
import { DepartmentComponent } from './department/department.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { TreatmentsComponent } from './treatments/treatments.component';

export const medicalproviderRoutes: Routes = [
  {
    path: '',
    component: ServicesComponent,
    data: { title: 'app.services' }
  },
  {
    path: 'services',
    children: [
      {
        path: '',
        component: ServicesComponent,
        data: { title: 'app.services' }
      },
      {
        path: ':id',
        component: StepsComponent,
        data: { title: 'app.steps' }
      }
    ]
  },
  {
    path: 'locations',
    component: LocationComponent,
    data: { title: 'app.locations' },
  },
  {
    path: 'departments',
    component: DepartmentComponent,
    data: { title: 'app.departments' },
  },
  {
    path: 'treatments',
    component: TreatmentsComponent,
    data: { title: 'app.treatments' },
  },
  {
    path: 'patients',
    children: [
      {
        path: '',
        component: PatientsComponent,
        data: { title: 'app.patients' },
      },
      {
        path: ':id',
        component: PatientDetailsComponent,
        data: { title: 'app.history' }
      }
    ]
  },
  {
    path: 'appointments',
    component: CalendarComponent,
    data: { title: 'app.appointments' }
  },
  {
    path: 'chat',
    component: ChatComponent,
    data: { title: 'app.chat' }
  },
  {
    path: 'configuration',
    component: ConfiguartionComponent,
    data: { title: 'app.configuration' },
  },
  {
    path: 'feedback',
    component: FeedbackComponent,
    data: { title: 'app.feedback' }
  },
  {
    path: 'news',
    component: NewsComponent,
    data: { title: 'app.news' }
  },
  {
    path: 'subscription',
    component: SubscriptionComponent,
    data: { title: 'app.subscription_plans' }
  },
  {
    path: 'settings',
    component: SettingComponent,
    data: { title: 'app.settings' },
  },


  //   path: 'services/steps',
  //   component: StepsComponent,
  //   data: { title: 'Steps' },
  // },
  // {
  //   path: 'services/steps/answer',
  //   component: AnswersComponent,
  //   data: { title: 'Answer' },
  // },
  // {
  //   path: 'services/steps/answer/predefine-answer',
  //   component: PredefineanswerComponent,
  //   data: { title: 'Answer' },
  // },
  // {
  //   path: 'services/steps/answer/subpredefine-answer',
  //   component: SubpredefineanswerComponent,
  //   data: { title: 'Answer' },
  // },
];
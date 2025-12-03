import { Routes } from '@angular/router';
import { SettingComponent } from '../shared/setting/setting.component';
import { FacilityComponent } from './facility/facility.component';
import { GalleryComponent } from './gallery/gallery.component';

export const superadminRoutes: Routes = [
    { path: '', component: FacilityComponent, data: { title: 'app.facility' } },
    { path: 'facility', component: FacilityComponent, data: { title: 'app.facility' } },
    { path: 'gallery', component: GalleryComponent, data: { title: 'app.avatar_gallery' } },
    { path: 'settings', component: SettingComponent, data: { title: 'app.settings' } },
]
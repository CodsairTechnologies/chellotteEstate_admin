import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { SettingsComponent } from './settings/settings.component';
import { HeroComponent } from './hero/hero.component';
import { TimelineComponent } from './timeline/timeline.component';
import { PlantationComponent } from './plantation/plantation.component';
import { TourismComponent } from './tourism/tourism.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AboutComponent } from './about/about.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ProductsComponent } from './products/products.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'hero', pathMatch: 'full' },

      { path: 'hero', component: HeroComponent },
      { path: 'timeline', component: TimelineComponent },
      { path: 'plantation', component: PlantationComponent },
      { path: 'tourism', component: TourismComponent },
      { path: 'testimonials', component: TestimonialsComponent },

      { path: 'gallery', component: GalleryComponent },

      { path: 'contacts', component: ContactsComponent },

      { path: 'settings', component: SettingsComponent },
      { path: 'about', component: AboutComponent },
      { path: 'about-us', component: AboutUsComponent },
      {path:'products',component:ProductsComponent}
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule { }

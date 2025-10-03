import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { BannerComponent } from './banner/banner.component';
import { HomeBookreviewComponent } from './home-bookreview/home-bookreview.component';
import { ShortStoriesComponent } from './short-stories/short-stories.component';
import { TableShortstoriesComponent } from './table-shortstories/table-shortstories.component';
import { BookReviewsComponent } from './book-reviews/book-reviews.component';
import { TableBookreviewsComponent } from './table-bookreviews/table-bookreviews.component';
import { ViewShortstoriesComponent } from './view-shortstories/view-shortstories.component';
import { ViewBookreviewsComponent } from './view-bookreviews/view-bookreviews.component';
import { PoemsComponent } from './poems/poems.component';
import { TablePoemsComponent } from './table-poems/table-poems.component';
import { ViewPoemComponent } from './view-poem/view-poem.component';
import { ArticlesComponent } from './articles/articles.component';
import { TableArticlesComponent } from './table-articles/table-articles.component';
import { ViewArticleComponent } from './view-article/view-article.component';
import { BookCornerComponent } from './book-corner/book-corner.component';
import { InterviewsComponent } from './interviews/interviews.component';
import { TableInterviewsComponent } from './table-interviews/table-interviews.component';
import { ViewInterviewsComponent } from './view-interviews/view-interviews.component';
import { EventsComponent } from './events/events.component';
import { TableEventsComponent } from './table-events/table-events.component';
import { ViewEventsComponent } from './view-events/view-events.component';
import { NovelsComponent } from './novels/novels.component';
import { TableNovelsComponent } from './table-novels/table-novels.component';
import { ViewNovelsComponent } from './view-novels/view-novels.component';
import { EventsbannerComponent } from './eventsbanner/eventsbanner.component';
import { BookreviewbannerComponent } from './bookreviewbanner/bookreviewbanner.component';
import { LetusreadwbannerComponent } from './letusreadwbanner/letusreadwbanner.component';
import { SettingsComponent } from './settings/settings.component';
import { EnquiryComponent } from './enquiry/enquiry.component';
import { ListcolumnsComponent } from './listcolumns/listcolumns.component';
import { ColumnsComponent } from './columns/columns.component';
import { ViewColumnsComponent } from './view-columns/view-columns.component';
import { BackupComponent } from './backup/backup.component';
import { HeroComponent } from './hero/hero.component';
import { TimelineComponent } from './timeline/timeline.component';
import { PlantationComponent } from './plantation/plantation.component';
import { TourismComponent } from './tourism/tourism.component';
import { FeaturedProductsComponent } from './featured-products/featured-products.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ContactsComponent } from './contacts/contacts.component';
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
      { path: 'featured-products', component: FeaturedProductsComponent },

      { path: 'gallery', component: GalleryComponent },

      { path: 'contacts', component: ContactsComponent },

      { path: 'settings', component: SettingsComponent }
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule { }

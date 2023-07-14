import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthComponent } from './auth/auth.component';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { MainPageComponent } from './main-page/main-page.component';
import { ManageComponent } from './manage/manage.component';
import { ConditionsComponent } from './conditions/conditions.component';
import { HttpClientModule } from '@angular/common/http';
import { SpinnerComponent } from './auth/spinner/spinner.component';
import { SettingsComponent } from './settings/settings.component';
import { NotesComponent } from './manage/notes/notes.component';
import { NotFoundComponent } from './page-not-found/not-found/not-found.component';


@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    HeaderComponent,
    MainPageComponent,
    ManageComponent,
    ConditionsComponent,
    SpinnerComponent,
    SettingsComponent,
    NotesComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    NgbDropdownModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

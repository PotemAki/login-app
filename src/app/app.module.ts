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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from "@angular/material/button"
import { AngularFireModule } from "@angular/fire/compat"
import { AngularFireStorageModule } from "@angular/fire/compat/storage"
import { environment } from 'src/environments/environment.development';

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
    NgbDropdownModule,
    BrowserAnimationsModule,
    MatButtonModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

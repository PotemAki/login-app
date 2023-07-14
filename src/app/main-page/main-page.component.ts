import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {

constructor(private router: Router) { }

goNotes() {
  this.router.navigate(['/manage'])
}
goSettings() {
  this.router.navigate(['/settings'])
}
}

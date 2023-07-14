import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

interface Note {
  title: string;
  content: string;
}
@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  private userSub!: Subscription;
  displayName = '';
  userEmail = '';
  notes: Note[] = [];
  newNote: Note = {
    title: '',
    content: ''
  };

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      if (user) {
        this.displayName = user.displayName
        this.userEmail = user.email
      } else {
        this.displayName = 'Guest';
        this.userEmail = '';
      }
    })
   this.saveLoadNote()
  }

  addNote() {
    if (this.newNote.title && this.newNote.content) {
      this.notes.push(this.newNote);
      this.newNote = {
        title: '',
        content: ''
      };
      localStorage.setItem(this.userEmail, JSON.stringify(this.notes));
    }
  }
  deleteNote(index) {
    this.notes.splice(index, 1);
    localStorage.setItem(this.userEmail, JSON.stringify(this.notes));
  }
  private saveLoadNote() {
    const storedNotes: { title: string; content: string; }[] = JSON.parse(localStorage.getItem(this.userEmail));
    if (storedNotes && storedNotes.length > 0) {
      this.notes = storedNotes;
    }
}

}

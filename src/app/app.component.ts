import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Student {
  id: number;
  name: string;
  age: number;
  average: number;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private http: HttpClient) {}

  selectedFile: File | null = null;
  students: Student[] = [];
  pagedStudents: Student[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onUpload() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:8080/student', formData).subscribe({
      next: response => alert("Dados processados com sucesso!"),
      error: err => console.error('Erro no upload:', err)
    });
  }

  onListStudents() {
    this.http.get<Student[]>('http://localhost:8080/student').subscribe({
      next: response => {
        this.students = response;
        this.totalPages = Math.ceil(this.students.length / this.pageSize);
        this.updatePagedStudents();
      },
      error: err => console.error('Erro ao consultar alunos:', err)
    });
  }

  updatePagedStudents() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedStudents = this.students.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedStudents();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedStudents();
    }
  }

  onReport() {
    this.http.get('http://localhost:8080/student/export', {
      responseType: 'blob'
    }).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);

        // Abre ou força o download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio_rodarte.xlsx';
        a.click();

        // Limpeza
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erro ao baixar o relatório:', err);
      }
    });
  }
}

import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Category, CategorySaveDTO, CategoryService } from '../service/category.service';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-crud-category',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule
  ],
  template: `
        <p-toast></p-toast>
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Novo" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Apagar" icon="pi pi-trash" outlined (onClick)="deleteSelectedProducts()" [disabled]="!selectedCategories || !selectedCategories.length" />
            </ng-template>

            <ng-template #end>
                <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="categories()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['name', 'status']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedCategories"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Apresentando do {first} até {last} de {totalRecords} categorias"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Controle de Categorias</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th style="min-width: 4rem">ID</th>
                    <th pSortableColumn="name" style="min-width:16rem">
                        Nome
                        <p-sortIcon field="name" />
                    </th>
                    <th pSortableColumn="description" style="min-width: 8rem">
                        Descrição
                        <p-sortIcon field="description" />
                    </th>
                    <th pSortableColumn="status" style="min-width: 12rem">
                        Status
                    </th>
                    <th></th>
                </tr>
            </ng-template>
            <ng-template #body let-category>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="category" />
                    </td>
                    <td style="min-width: 4rem">{{ category.id }}</td>
                    <td style="min-width: 16rem">{{ category.name }}</td>
                    <td>{{ category.description }}</td>
                    <td>{{ category.status? "Ativo" : "Desativado" }}</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editCategory(category)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteCategory(category)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="categoryDialog" [style]="{ width: '450px' }" header="Detalhas de Categoria" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="name" class="block font-bold mb-3">Nome</label>
                        <input type="text" pInputText id="name" [(ngModel)]="newCategory.name" required autofocus fluid />
                        <small class="text-red-500" *ngIf="submitted && !newCategory.name">Nome é obrigatório.</small>
                    </div>
                    <div>
                        <label for="description" class="block font-bold mb-3">Descrição</label>
                        <textarea id="description" pTextarea [(ngModel)]="newCategory.description" required rows="3" cols="20" fluid></textarea>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancelar" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Salvar" icon="pi pi-check" (click)="saveCategory()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
  providers: [MessageService, CategoryService, ConfirmationService]
})
export class CategoryPage implements OnInit {
  categoryDialog: boolean = false;

  categories = signal<Category[]>([]);

  newCategory!: CategorySaveDTO;
  category!: Category;

  selectedCategories!: Category[] | null;

  submitted: boolean = false;

  statuses!: any[];

  @ViewChild('dt') dt!: Table;

  exportColumns!: ExportColumn[];

  cols!: Column[];

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  exportCSV() {
    this.dt.exportCSV();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.categoryService.getAllCategories().subscribe((data) => {
      this.categories.set(data);
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.newCategory = { name: '', description: '' };
    this.submitted = false;
    this.categoryDialog = true;
  }

  editCategory(category: Category) {
    this.category = category;
    
    this.newCategory = { 
      name: this.category.name?.trim() || '', 
      description: this.category.description?.trim() || '' 
    };

    this.categoryDialog = true;
  }

  deleteSelectedProducts() {
    // this.confirmationService.confirm({
    //   message: 'Are you sure you want to delete the selected products?',
    //   header: 'Confirm',
    //   icon: 'pi pi-exclamation-triangle',
    //   accept: () => {
    //     this.products.set(this.products().filter((val) => !this.selectedProducts?.includes(val)));
    //     this.selectedProducts = null;
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Successful',
    //       detail: 'Products Deleted',
    //       life: 3000
    //     });
    //   }
    // });
  }

  hideDialog() {
    this.categoryDialog = false;
    this.submitted = false;
  }

  deleteCategory(category: Category) {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja deletar a categoria ' + category.name + '?',
      header: 'Confirmação',
      acceptLabel: 'Sim',
      rejectLabel: 'Cancelar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categoryService.deleteCategory(category.id || 0).subscribe((data) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Categoria deletada',
            life: 3000
          });
          category.status = false;
          // this.loadData();
        }, (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao deletar categoria',
            life: 3000
          });
        });
      }
    });
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.categories().length; i++) {
      if (this.categories()[i].id?.toString() === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  saveCategory() {
    this.submitted = true;
    let _products = this.categories();

    if (!this.newCategory.name?.trim()) {
      return;
    }

    if (this.category?.id) {
      this.category.name = this.newCategory.name;
      this.category.description = this.newCategory.description;

      this.categoryService.updateCategory(this.category).subscribe((data) => {
        this.categoryDialog = false;
        this.newCategory = { name: '', description: '' };
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Categoria atualizada',
          life: 3000
        });
        this.loadData();
      }, (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar categoria',
          life: 3000
        });
      });
    } else {
      this.categoryService.saveNewCategory(this.newCategory).subscribe((data) => {
        this.categoryDialog = false;
        this.newCategory = { name: '', description: '' };
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Categoria criada',
          life: 3000
        });
        this.loadData();
      }, (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao criar categoria',
          life: 3000
        });
      });
    }
  }

}

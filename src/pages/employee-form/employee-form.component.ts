import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { ToasterCustomService } from '../../services/toaster.service';
import { EmployeeFormService } from '../../services/employee-form.service';
import { IEmployeeForm } from '../../interfaces/employee form/IEmployeeForm';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import { FormsModule } from '@angular/forms';

export type FieldKind = 'text' | 'date' | 'boolean' | 'email' | 'tel' | 'textarea';

@Component({
    selector: 'app-employee-form',
    imports: [NgFor, NgIf, FormsModule, NgSwitchCase, NgSwitchDefault, NgSwitch],
    standalone: true,
    templateUrl: './employee-form.component.html',
    styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  @ViewChild('questionInput') questionInput!: ElementRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

  employees: IEmployeeForm[] = [];

  newEmployee: any = this.getEmptyEmployee();

  searchTerm: string = '';

  showConfirmDelete: boolean = false;

  deletedEmployee: string = '';

  editingId: string | null = null;

  columnKeys: (keyof IEmployeeForm)[] = [
    'id', 'firstName', 'lastName', 'patronymic', 'dateOfBirth', 'militaryStatus',
    'citizenship', 'nationality', 'drivingLicense', 'education', 'religion',
    'badHabits', 'maritalStatus', 'guardianshipOrDisabledUnderCare', 'chronicDiseases',
    'distinctSkills', 'specialStatus', 'hobbiesOrActivities', 'currentAddress',
    'phoneNumber', 'email', 'appliedPosition', 'sourceOfJobInfo', 'hasCriminalRecord',
    'hiredDate', 'dismissedDate', 'trainings', 'workExperiences', 'familyMembers',
    'createdDate', 'createdBy'
  ];

  readonly azLabels: Record<keyof IEmployeeForm, string> = {
    id: 'ID',
    firstName: 'Ad',
    lastName: 'Soyad',
    patronymic: 'Ata adı',
    dateOfBirth: 'Təvəllüd',
    militaryStatus: 'Hərbi mükəlləfiyyət',
    citizenship: 'Vətəndaşlıq',
    nationality: 'Milliyəti',
    drivingLicense: 'Sürücülük vəsiqəsi',
    education: 'Təhsil',
    religion: 'Dini mənsubiyyəti',
    badHabits: 'Pis vərdişləri',
    maritalStatus: 'Ailə vəziyyəti',
    guardianshipOrDisabledUnderCare: 'Himayəsində əlil və ya qəyyumluq',
    chronicDiseases: 'Xroniki xəstəlik',
    distinctSkills: 'Texniki biliklər',
    specialStatus: 'Status: Əlil, qazi, veteran və s.',
    hobbiesOrActivities: 'Maraq göstərdiyi hobbi',
    currentAddress: 'Faktiki yaşadığı ünvan',
    phoneNumber: 'Telefon nömrəsi',
    email: 'E-poçt',
    appliedPosition: 'Müraciət etdiyi vəzifə',
    sourceOfJobInfo: 'Vəzifə üzrə məlumat mənbəyi',
    hasCriminalRecord: 'Məhkumluq',
    hiredDate: 'İşə qəbul tarixi',
    dismissedDate: 'İşdən çıxma tarixi',
    trainings: 'Əlavə təlimlər',
    workExperiences: 'İş təcrübəsi',
    familyMembers: 'Ailə tərkibi',
    createdDate: 'Yaradılma tarixi',
    createdBy: 'Yaradan'
  };

  showModal = false;
  questionIndex = 0;

  orderedKeys: (keyof IEmployeeForm)[] = [
    'firstName', 'lastName', 'patronymic', 'dateOfBirth', 'militaryStatus', 'citizenship',
    'nationality', 'drivingLicense', 'education', 'trainings', 'distinctSkills', 'hobbiesOrActivities',
    'hasCriminalRecord', 'religion', 'badHabits', 'maritalStatus', 'familyMembers',
    'guardianshipOrDisabledUnderCare', 'chronicDiseases', 'specialStatus', 'currentAddress',
    'phoneNumber', 'email', 'appliedPosition', 'sourceOfJobInfo', 'workExperiences'
  ];

  constructor(
    private loaderService: LoaderService,
    private toastrService: ToasterCustomService,
    private employeeService: EmployeeFormService
  ) {}

  ngOnInit(): void {
    this.loaderService.show();
    this.employeeService.getEmployeeForms().subscribe({
      next: (res: IEmployeeForm[]) => {
        this.employees = res;
        this.toastrService.info('Əməkdaş анketləri yükləndi!');
        this.loaderService.hide();
      },
      error: () => {
        this.toastrService.error('Əməkdaş anketləri yüklənən zamanı xəta baş verdi!');
        this.loaderService.hide();
      }
    });
  }

  private getEmptyEmployee() {
    return {
      firstName: '',
      lastName: '',
      patronymic: '',
      dateOfBirth: '',
      militaryStatus: '',
      citizenship: '',
      nationality: '',
      drivingLicense: '',
      education: '',
      religion: '',
      badHabits: '',
      maritalStatus: '',
      guardianshipOrDisabledUnderCare: '',
      chronicDiseases: '',
      distinctSkills: '',
      specialStatus: '',
      hobbiesOrActivities: '',
      currentAddress: '',
      phoneNumber: '',
      email: '',
      appliedPosition: '',
      sourceOfJobInfo: '',
      hasCriminalRecord: false,
      createdBy: '',
      createdDate: '',
      hiredDate: '',
      dismissedDate: null,
      trainings: [],
      workExperiences: [],
      familyMembers: []
    };
  }

  onAddEmployee(): void {
    this.newEmployee = this.getEmptyEmployee();
    this.editingId = null;
    this.questionIndex = 0;
    this.showModal = true;
    this.focusQuestion();
  }

  closeModal(): void {
    this.showModal = false;
  }

  nextQuestion(): void {
    if (!this.isCurrentValid()) return;
    if (this.questionIndex < this.orderedKeys.length - 1) {
      this.questionIndex++;
      this.focusQuestion();
    } else {
      this.saveEmployee();
    }
  }

  prevQuestion(): void {
    if (this.questionIndex > 0) {
      this.questionIndex--;
      this.focusQuestion();
    }
  }

  private focusQuestion() {
    setTimeout(() => this.questionInput?.nativeElement?.focus());
  }

  currentKey(): keyof IEmployeeForm {
    return this.orderedKeys[this.questionIndex];
  }

  formatLabel(key: keyof IEmployeeForm): string {
    return this.azLabels[key] || (key as string);
  }

  formatValue(value: any): string {
    if (Array.isArray(value)) return `${value.length} item(s)`;
    if (typeof value === 'boolean') return value ? 'Bəli' : 'Xeyr';
    return value ?? '';
  }

  isArray(key: string): boolean {
    return ['trainings', 'workExperiences', 'familyMembers'].includes(key);
  }

  fieldKind(key: keyof IEmployeeForm): FieldKind {
    const dateFields: ReadonlyArray<keyof IEmployeeForm> = ['dateOfBirth', 'hiredDate', 'dismissedDate', 'createdDate'];
    if (dateFields.includes(key)) return 'date';
    if (key === 'hasCriminalRecord') return 'boolean';
    if (key === 'email') return 'email';
    if (key === 'phoneNumber') return 'tel';
    const longText: ReadonlyArray<keyof IEmployeeForm> = [
      'distinctSkills', 'hobbiesOrActivities', 'badHabits', 'religion', 'currentAddress',
      'specialStatus', 'guardianshipOrDisabledUnderCare', 'chronicDiseases', 'sourceOfJobInfo', 'education'
    ];
    if (longText.includes(key)) return 'textarea';
    return 'text';
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.nextQuestion(); }
    if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); this.prevQuestion(); }
  }

  get filteredEmployees(): IEmployeeForm[] {
    const term = this.searchTerm.toLowerCase();
    return this.employees.filter(emp =>
      (emp.firstName + ' ' + emp.lastName + ' ' + emp.patronymic).toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.phoneNumber?.toLowerCase().includes(term) ||
      emp.appliedPosition?.toLowerCase().includes(term)
    );
  }

  editEmployee(employee: IEmployeeForm): void {
    this.newEmployee = {
      ...this.getEmptyEmployee(),
      ...employee,
      dateOfBirth: this.toDateInput(employee.dateOfBirth as any),
      hiredDate: this.toDateInput(employee.hiredDate as any),
      dismissedDate: this.toDateInput(employee.dismissedDate as any),
      createdDate: this.toDateInput(employee.createdDate as any),
      trainings: (employee.trainings || []).map(t => ({
        ...t,
        dateCompleted: this.toDateInput((t as any).dateCompleted),
        createdDate: this.toDateInput((t as any).createdDate),
      })),
      workExperiences: (employee.workExperiences || []).map(w => ({
        ...w,
        startDate: this.toDateInput((w as any).startDate),
        endDate: this.toDateInput((w as any).endDate),
        createdDate: this.toDateInput((w as any).createdDate),
      })),
      familyMembers: (employee.familyMembers || []).map(f => ({
        ...f,
        dateOfBirth: this.toDateInput((f as any).dateOfBirth),
        createdDate: this.toDateInput((f as any).createdDate),
      }))
    };
    this.editingId = employee.id;
    this.showModal = true;
    this.questionIndex = 0;
    this.focusQuestion();
  }

  deleteEmployee(id: string): void {
    this.showConfirmDelete = true;
    this.deletedEmployee = id;
  }

  private proceedDeleteEmployeeForm(id: string) {
    this.loaderService.show();
    this.employeeService.deleteEmployeeForm(id).subscribe({
      next: () => {
        this.employees = this.employees.filter(e => e.id !== id);
        this.toastrService.success('Əməkdaş müvəffəqiyyətlə silindi!');
        this.loaderService.hide();
      },
      error: () => {
        this.toastrService.error('Əməkdaş silinən zamanı xəta baş verdi!');
        this.loaderService.hide();
      }
    });
  }

  onConfirmDelete() {
    if (!this.deletedEmployee) return;
    this.proceedDeleteEmployeeForm(this.deletedEmployee);
    this.showConfirmDelete = false;
    this.deletedEmployee = '';
  }

  onCancel() {
    this.showConfirmDelete = false;
    this.deletedEmployee = '';
  }

  addTraining() {
    this.newEmployee.trainings ??= [];
    this.newEmployee.trainings.push({
      title: '',
      dateCompleted: '',
      createdDate: new Date().toISOString()
    });
  }
  removeTraining(i: number) {
    this.newEmployee.trainings.splice(i, 1);
  }

  addWorkExperience() {
    this.newEmployee.workExperiences ??= [];
    this.newEmployee.workExperiences.push({
      companyName: '',
      position: '',
      startDate: '',
      endDate: '',
      responsibilities: '',
      createdDate: new Date().toISOString()
    });
  }
  removeWorkExperience(i: number) {
    this.newEmployee.workExperiences.splice(i, 1);
  }

  addFamilyMember() {
    this.newEmployee.familyMembers ??= [];
    this.newEmployee.familyMembers.push({
      name: '',
      relationship: '',
      dateOfBirth: '',
      createdDate: new Date().toISOString()
    });
  }
  removeFamilyMember(i: number) {
    this.newEmployee.familyMembers.splice(i, 1);
  }

  private isCurrentArrayStepValid(): boolean {
    const key = this.currentKey();
    if (key === 'trainings') {
      const arr = this.newEmployee.trainings || [];
      if (arr.length < 1) return false;
      return arr.every((t: any) => (t.title || '').trim().length > 0 && (t.dateCompleted || '').trim().length > 0);
    }
    if (key === 'workExperiences') {
      const arr = this.newEmployee.workExperiences || [];
      if (arr.length < 1) return false;
      return arr.every((w: any) =>
        (w.companyName || '').trim().length > 0 &&
        (w.position || '').trim().length > 0 &&
        (w.startDate || '').trim().length > 0
      );
    }
    if (key === 'familyMembers') {
      const arr = this.newEmployee.familyMembers || [];
      if (arr.length < 1) return false;
      return arr.every((f: any) =>
        (f.name || '').trim().length > 0 &&
        (f.relationship || '').trim().length > 0 &&
        (f.dateOfBirth || '').trim().length > 0
      );
    }
    return true;
  }

  isCurrentValid(): boolean {
    const key = this.currentKey();
    if (this.isArray(key)) return this.isCurrentArrayStepValid();
    const v = this.newEmployee[key];
    if (this.fieldKind(key) === 'boolean') return v === true || v === false;
    if (typeof v === 'string') return v.trim().length > 0;
    return !!v;
  }

  private buildBody() {
    return {
      firstName: this.newEmployee.firstName,
      lastName: this.newEmployee.lastName,
      patronymic: this.newEmployee.patronymic,
      dateOfBirth: this.newEmployee.dateOfBirth,
      militaryStatus: this.newEmployee.militaryStatus,
      citizenship: this.newEmployee.citizenship,
      nationality: this.newEmployee.nationality,
      drivingLicense: this.newEmployee.drivingLicense,
      education: this.newEmployee.education,
      religion: this.newEmployee.religion,
      badHabits: this.newEmployee.badHabits,
      maritalStatus: this.newEmployee.maritalStatus,
      guardianshipOrDisabledUnderCare: this.newEmployee.guardianshipOrDisabledUnderCare,
      chronicDiseases: this.newEmployee.chronicDiseases,
      distinctSkills: this.newEmployee.distinctSkills,
      specialStatus: this.newEmployee.specialStatus,
      hobbiesOrActivities: this.newEmployee.hobbiesOrActivities,
      currentAddress: this.newEmployee.currentAddress,
      phoneNumber: this.newEmployee.phoneNumber,
      email: this.newEmployee.email,
      appliedPosition: this.newEmployee.appliedPosition,
      sourceOfJobInfo: this.newEmployee.sourceOfJobInfo,
      hasCriminalRecord: !!this.newEmployee.hasCriminalRecord,
      createdBy: this.newEmployee.createdBy || 'hr.admin',
      createdDate: new Date().toISOString(),
      hiredDate: this.normDate(this.newEmployee.hiredDate),
      dismissedDate: this.normDate(this.newEmployee.dismissedDate),
      trainings: (this.newEmployee.trainings || []).map((t: any) => ({
        title: t.title,
        dateCompleted: this.normDate(t.dateCompleted),
        createdDate: t.createdDate || new Date().toISOString()
      })),
      workExperiences: (this.newEmployee.workExperiences || []).map((w: any) => ({
        companyName: w.companyName,
        position: w.position,
        startDate: this.normDate(w.startDate),
        endDate: this.normDate(w.endDate),
        responsibilities: w.responsibilities,
        createdDate: w.createdDate || new Date().toISOString()
      })),
      familyMembers: (this.newEmployee.familyMembers || []).map((f: any) => ({
        name: f.name,
        relationship: f.relationship,
        dateOfBirth: this.normDate(f.dateOfBirth),
        createdDate: f.createdDate || new Date().toISOString()
      }))
    };
  }

  saveEmployee(): void {
    const body = this.buildBody();
    this.loaderService.show();
    if (this.editingId) {
      this.employeeService.updateEmployeeForm(this.editingId, body).subscribe({
        next: (updated: IEmployeeForm) => {
          const idx = this.employees.findIndex(e => e.id === this.editingId);
          if (idx >= 0) this.employees[idx] = updated;
          this.toastrService.success('Əməkdaş yeniləndi!');
          this.showModal = false;
          this.editingId = null;
          this.loaderService.hide();
        },
        error: () => {
          this.toastrService.error('Yenilənmə zamanı xəта baş verdi.');
          this.loaderService.hide();
        }
      });
    } else {
      this.employeeService.createEmployeeForm(body).subscribe((response) => {
        if (response){
          this.closeModal();
          this.toastrService.success('Əməkdaş əlavə olundu!');
          setTimeout(() => {
            this.employeeService.getEmployeeForms();
          }, 1500)
        }
        else {
          this.toastrService.error('Əlavə etmə zamanı xəta baş verdi.');
        }
        this.loaderService.hide();
      })
    }
  }

  private normDate(v: string | null | undefined): string | null {
    return v && v.toString().trim().length > 0 ? v : null;
  }

  private toDateInput(v: string | null | undefined): string {
    if (!v) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = new Date(v);
    if (isNaN(d.getTime())) return '';
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 10);
  }
}

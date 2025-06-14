// Otomatik Ders Programı Oluşturucu
import { Teacher, Class, Subject, Schedule, DAYS, PERIODS } from '../types';

export interface GenerationOptions {
  maxDailyHours: number; // Günlük maksimum ders saati
  mode: 'balanced' | 'compact' | 'spread'; // Dağılım modu
  avoidConsecutive: boolean; // Aynı dersin peş peşe gelmesini engelle
  prioritizeCore: boolean; // Ana dersleri önceliklendir
  respectTimeSlots: boolean; // Zaman dilimlerini dikkate al
  preferMorningHours: boolean; // Sabah saatlerini tercih et
  teacherWeeklyHours: { [teacherId: string]: number }; // Öğretmen haftalık ders saatleri
}

export interface GenerationResult {
  success: boolean;
  schedules: Schedule[];
  conflicts: string[];
  warnings: string[];
  statistics: {
    totalSlots: number;
    filledSlots: number;
    emptySlots: number;
    teachersAssigned: number;
    classesAssigned: number;
  };
}

export interface TeacherWorkload {
  teacherId: string;
  maxWeeklyHours: number;
  currentHours: number;
  preferredDays?: string[];
  avoidDays?: string[];
  preferredPeriods?: string[];
  avoidPeriods?: string[];
}

export class ScheduleGeneratorEngine {
  private teachers: Teacher[];
  private classes: Class[];
  private subjects: Subject[];
  private options: GenerationOptions;
  private teacherWorkloads: Map<string, TeacherWorkload>;
  private generatedSchedules: Map<string, Schedule>;
  private conflicts: string[];
  private warnings: string[];

  constructor(
    teachers: Teacher[],
    classes: Class[],
    subjects: Subject[],
    options: GenerationOptions
  ) {
    this.teachers = teachers;
    this.classes = classes;
    this.subjects = subjects;
    this.options = options;
    this.teacherWorkloads = new Map();
    this.generatedSchedules = new Map();
    this.conflicts = [];
    this.warnings = [];

    this.initializeTeacherWorkloads();
  }

  private initializeTeacherWorkloads() {
    this.teachers.forEach(teacher => {
      const maxHours = this.options.teacherWeeklyHours[teacher.id] || 20;
      this.teacherWorkloads.set(teacher.id, {
        teacherId: teacher.id,
        maxWeeklyHours: maxHours,
        currentHours: 0
      });
    });
  }

  async generateSchedules(): Promise<GenerationResult> {
    console.log('🤖 Otomatik program oluşturma başlatıldı');
    
    try {
      // 1. Öğretmen programlarını sıfırla
      this.resetSchedules();

      // 2. Sabit periyotları ekle
      this.addFixedPeriods();

      // 3. Ana dersleri öncelikle ata
      if (this.options.prioritizeCore) {
        await this.assignCoreSubjects();
      }

      // 4. Kalan dersleri ata
      await this.assignRemainingSubjects();

      // 5. Boş slotları doldur
      await this.fillEmptySlots();

      // 6. Optimizasyon yap
      await this.optimizeSchedules();

      const statistics = this.calculateStatistics();

      return {
        success: this.conflicts.length === 0,
        schedules: Array.from(this.generatedSchedules.values()),
        conflicts: this.conflicts,
        warnings: this.warnings,
        statistics
      };

    } catch (error) {
      console.error('❌ Program oluşturma hatası:', error);
      return {
        success: false,
        schedules: [],
        conflicts: [`Sistem hatası: ${error}`],
        warnings: this.warnings,
        statistics: {
          totalSlots: 0,
          filledSlots: 0,
          emptySlots: 0,
          teachersAssigned: 0,
          classesAssigned: 0
        }
      };
    }
  }

  private resetSchedules() {
    this.teachers.forEach(teacher => {
      const schedule: Schedule = {
        id: `auto-${teacher.id}`,
        teacherId: teacher.id,
        schedule: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.generatedSchedules.set(teacher.id, schedule);
      
      // Workload'ı sıfırla
      const workload = this.teacherWorkloads.get(teacher.id);
      if (workload) {
        workload.currentHours = 0;
      }
    });
  }

  private addFixedPeriods() {
    this.teachers.forEach(teacher => {
      const schedule = this.generatedSchedules.get(teacher.id);
      if (!schedule) return;

      DAYS.forEach(day => {
        if (!schedule.schedule[day]) {
          schedule.schedule[day] = {};
        }

        // Hazırlık/Kahvaltı periyodu
        if (teacher.level === 'Ortaokul') {
          schedule.schedule[day]['prep'] = {
            subjectId: 'fixed-prep',
            classId: 'fixed-period'
          };
          // Ortaokul için 1. ve 2. ders arası kahvaltı
          schedule.schedule[day]['breakfast'] = {
            subjectId: 'fixed-breakfast',
            classId: 'fixed-period'
          };
        } else {
          schedule.schedule[day]['prep'] = {
            subjectId: 'fixed-breakfast',
            classId: 'fixed-period'
          };
        }

        // Yemek periyodu
        const lunchPeriod = (teacher.level === 'İlkokul' || teacher.level === 'Anaokulu') ? '5' : '6';
        schedule.schedule[day][lunchPeriod] = {
          subjectId: 'fixed-lunch',
          classId: 'fixed-period'
        };

        // İkindi kahvaltısı
        schedule.schedule[day]['afternoon-breakfast'] = {
          subjectId: 'fixed-afternoon-breakfast',
          classId: 'fixed-period'
        };
      });
    });
  }

  private async assignCoreSubjects() {
    const coreSubjects = ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler'];
    
    for (const subjectName of coreSubjects) {
      await this.assignSubjectToClasses(subjectName, true);
    }
  }

  private async assignRemainingSubjects() {
    const assignedSubjects = new Set(['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler']);
    
    for (const subject of this.subjects) {
      if (!assignedSubjects.has(subject.name)) {
        await this.assignSubjectToClasses(subject.name, false);
      }
    }
  }

  private async assignSubjectToClasses(subjectName: string, isCore: boolean) {
    const relevantSubjects = this.subjects.filter(s => s.name === subjectName);
    
    for (const subject of relevantSubjects) {
      const eligibleTeachers = this.teachers.filter(t => 
        t.branch === subject.branch && 
        t.level === subject.level
      );

      const eligibleClasses = this.classes.filter(c => c.level === subject.level);

      for (const classItem of eligibleClasses) {
        await this.assignSubjectToClass(subject, classItem, eligibleTeachers, isCore);
      }
    }
  }

  private async assignSubjectToClass(
    subject: Subject, 
    classItem: Class, 
    eligibleTeachers: Teacher[], 
    isCore: boolean
  ) {
    const requiredHours = subject.weeklyHours;
    let assignedHours = 0;

    // Öğretmenleri workload'a göre sırala
    const sortedTeachers = eligibleTeachers.sort((a, b) => {
      const workloadA = this.teacherWorkloads.get(a.id)!;
      const workloadB = this.teacherWorkloads.get(b.id)!;
      
      const remainingA = workloadA.maxWeeklyHours - workloadA.currentHours;
      const remainingB = workloadB.maxWeeklyHours - workloadB.currentHours;
      
      return remainingB - remainingA; // En az yüklü öğretmen önce
    });

    for (const teacher of sortedTeachers) {
      if (assignedHours >= requiredHours) break;

      const workload = this.teacherWorkloads.get(teacher.id)!;
      const remainingCapacity = workload.maxWeeklyHours - workload.currentHours;
      
      if (remainingCapacity <= 0) continue;

      const hoursToAssign = Math.min(
        requiredHours - assignedHours,
        remainingCapacity,
        this.options.maxDailyHours
      );

      const assignedSlots = await this.assignHoursToTeacher(
        teacher, 
        classItem, 
        subject, 
        hoursToAssign, 
        isCore
      );

      assignedHours += assignedSlots;
      workload.currentHours += assignedSlots;
    }

    if (assignedHours < requiredHours) {
      this.warnings.push(
        `${classItem.name} sınıfı için ${subject.name} dersi tam olarak atanamadı (${assignedHours}/${requiredHours})`
      );
    }
  }

  private async assignHoursToTeacher(
    teacher: Teacher,
    classItem: Class,
    subject: Subject,
    hoursToAssign: number,
    isCore: boolean
  ): Promise<number> {
    const schedule = this.generatedSchedules.get(teacher.id)!;
    let assignedCount = 0;

    const availableSlots = this.getAvailableSlots(teacher, classItem);
    
    // Slot'ları öncelik sırasına göre sırala
    const prioritizedSlots = this.prioritizeSlots(availableSlots, isCore);

    for (const slot of prioritizedSlots) {
      if (assignedCount >= hoursToAssign) break;

      const { day, period } = slot;

      // Çakışma kontrolü
      if (this.hasConflict(teacher, classItem, day, period)) {
        continue;
      }

      // Peş peşe ders kontrolü
      if (this.options.avoidConsecutive && this.hasConsecutiveSubject(teacher, subject, day, period)) {
        continue;
      }

      // Slot'u ata
      if (!schedule.schedule[day]) {
        schedule.schedule[day] = {};
      }

      schedule.schedule[day][period] = {
        subjectId: subject.id,
        classId: classItem.id
      };

      assignedCount++;
    }

    return assignedCount;
  }

  private getAvailableSlots(teacher: Teacher, classItem: Class): Array<{day: string, period: string}> {
    const schedule = this.generatedSchedules.get(teacher.id)!;
    const availableSlots: Array<{day: string, period: string}> = [];

    DAYS.forEach(day => {
      PERIODS.forEach(period => {
        // Sabit periyotları atla
        if (this.isFixedPeriod(period, teacher.level)) {
          return;
        }

        // Zaten dolu slot'ları atla
        if (schedule.schedule[day]?.[period]) {
          return;
        }

        availableSlots.push({ day, period });
      });
    });

    return availableSlots;
  }

  private prioritizeSlots(
    slots: Array<{day: string, period: string}>, 
    isCore: boolean
  ): Array<{day: string, period: string}> {
    return slots.sort((a, b) => {
      // Ana dersler için sabah saatlerini tercih et
      if (isCore && this.options.preferMorningHours) {
        const periodA = parseInt(a.period);
        const periodB = parseInt(b.period);
        
        if (periodA !== periodB) {
          return periodA - periodB;
        }
      }

      // Gün dağılımını dengele
      const dayPriorityA = this.getDayPriority(a.day);
      const dayPriorityB = this.getDayPriority(b.day);
      
      return dayPriorityA - dayPriorityB;
    });
  }

  private getDayPriority(day: string): number {
    const dayIndex = DAYS.indexOf(day);
    
    // Haftanın ortasını tercih et (Salı, Çarşamba, Perşembe)
    if (this.options.mode === 'balanced') {
      const priorities = [2, 0, 1, 0, 2]; // Pazartesi, Salı, Çarşamba, Perşembe, Cuma
      return priorities[dayIndex] || 3;
    }
    
    return dayIndex;
  }

  private hasConflict(teacher: Teacher, classItem: Class, day: string, period: string): boolean {
    // Sınıfın bu saatte başka öğretmeni var mı?
    for (const [teacherId, schedule] of this.generatedSchedules) {
      if (teacherId === teacher.id) continue;
      
      const slot = schedule.schedule[day]?.[period];
      if (slot?.classId === classItem.id) {
        return true;
      }
    }

    return false;
  }

  private hasConsecutiveSubject(teacher: Teacher, subject: Subject, day: string, period: string): boolean {
    const schedule = this.generatedSchedules.get(teacher.id)!;
    const periodNum = parseInt(period);

    // Önceki ders
    const prevPeriod = (periodNum - 1).toString();
    const prevSlot = schedule.schedule[day]?.[prevPeriod];
    if (prevSlot?.subjectId === subject.id) {
      return true;
    }

    // Sonraki ders
    const nextPeriod = (periodNum + 1).toString();
    const nextSlot = schedule.schedule[day]?.[nextPeriod];
    if (nextSlot?.subjectId === subject.id) {
      return true;
    }

    return false;
  }

  private isFixedPeriod(period: string, level: 'Anaokulu' | 'İlkokul' | 'Ortaokul'): boolean {
    if (period === 'prep' || period === 'breakfast' || period === 'afternoon-breakfast') {
      return true;
    }

    // Yemek saatleri
    if ((level === 'İlkokul' || level === 'Anaokulu') && period === '5') {
      return true;
    }
    if (level === 'Ortaokul' && period === '6') {
      return true;
    }

    return false;
  }

  private async fillEmptySlots() {
    // Boş slot'ları doldurma mantığı
    // Bu kısım isteğe bağlı olarak uygulanabilir
  }

  private async optimizeSchedules() {
    // Program optimizasyonu
    // Daha iyi dağılım için slot'ları yeniden düzenle
  }

  private calculateStatistics() {
    let totalSlots = 0;
    let filledSlots = 0;
    const assignedTeachers = new Set<string>();
    const assignedClasses = new Set<string>();

    for (const [teacherId, schedule] of this.generatedSchedules) {
      let hasAssignment = false;

      DAYS.forEach(day => {
        PERIODS.forEach(period => {
          if (!this.isFixedPeriod(period, this.teachers.find(t => t.id === teacherId)!.level)) {
            totalSlots++;

            const slot = schedule.schedule[day]?.[period];
            if (slot?.classId && slot.classId !== 'fixed-period') {
              filledSlots++;
              hasAssignment = true;
              assignedClasses.add(slot.classId);
            }
          }
        });
      });

      if (hasAssignment) {
        assignedTeachers.add(teacherId);
      }
    }

    return {
      totalSlots,
      filledSlots,
      emptySlots: totalSlots - filledSlots,
      teachersAssigned: assignedTeachers.size,
      classesAssigned: assignedClasses.size
    };
  }
}

// Varsayılan seçenekler
export const getDefaultGenerationOptions = (): GenerationOptions => ({
  maxDailyHours: 8,
  mode: 'balanced',
  avoidConsecutive: true,
  prioritizeCore: true,
  respectTimeSlots: true,
  preferMorningHours: true,
  teacherWeeklyHours: {}
});

// Seçenek doğrulama
export const validateGenerationOptions = (options: GenerationOptions): string[] => {
  const errors: string[] = [];

  if (options.maxDailyHours < 1 || options.maxDailyHours > 10) {
    errors.push('Günlük maksimum ders saati 1-10 arasında olmalıdır');
  }

  if (!['balanced', 'compact', 'spread'].includes(options.mode)) {
    errors.push('Geçersiz dağılım modu');
  }

  return errors;
};
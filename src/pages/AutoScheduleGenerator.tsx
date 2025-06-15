import React, { useState } from 'react';
import { Zap, Settings, Play, Download, AlertTriangle, CheckCircle, Clock, Users, Building, BookOpen, Calendar } from 'lucide-react';
import { Teacher, Class, Subject, Schedule, getTimeForPeriod, formatTimeRange } from '../types';
import { useFirestore } from '../hooks/useFirestore';
import { useToast } from '../hooks/useToast';
import { useConfirmation } from '../hooks/useConfirmation';
import { 
  ScheduleGeneratorEngine, 
  GenerationOptions, 
  GenerationResult,
  getDefaultGenerationOptions,
  validateGenerationOptions
} from '../utils/scheduleGenerator';
import Button from '../components/UI/Button';
import Select from '../components/UI/Select';
import Modal from '../components/UI/Modal';
import ConfirmationModal from '../components/UI/ConfirmationModal';

const AutoScheduleGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>(getDefaultGenerationOptions());
  const [showResultModal, setShowResultModal] = useState(false);

  const { data: teachers } = useFirestore<Teacher>('teachers');
  const { data: classes } = useFirestore<Class>('classes');
  const { data: subjects } = useFirestore<Subject>('subjects');
  const { data: schedules, add: addSchedule, update: updateSchedule } = useFirestore<Schedule>('schedules');
  const { success, error, warning } = useToast();
  const { 
    confirmation, 
    showConfirmation, 
    hideConfirmation
  } = useConfirmation();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      // Validate options
      const validation = validateGenerationOptions(generationOptions);
      if (validation.length > 0) {
        error('Validation Error', validation.join(', '));
        return;
      }

      // Initialize generator
      const generator = new ScheduleGeneratorEngine(teachers, classes, subjects, generationOptions);
      
      // Generate schedule
      const result = await generator.generateSchedules();
      
      setGenerationResult(result);
      setShowResultModal(true);
      
      if (result.success) {
        success('Schedule Generated', 'Schedule generated successfully!');
      } else {
        warning('Partial Success', 'Schedule generation completed with issues');
      }
    } catch (err) {
      console.error('Generation error:', err);
      error('Generation Failed', 'Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!generationResult?.schedules) return;

    try {
      for (const schedule of generationResult.schedules) {
        const scheduleData: Omit<Schedule, 'id'> = {
          teacherId: schedule.teacherId,
          schedule: schedule.schedule,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await addSchedule(scheduleData);
      }
      
      success('Schedules Saved', 'All schedules saved successfully!');
      setShowResultModal(false);
    } catch (err) {
      console.error('Save error:', err);
      error('Save Failed', 'Failed to save schedules');
    }
  };

  const getGenerationStats = () => {
    if (!generationResult?.schedules) return null;

    let totalSlots = 0;
    let filledSlots = 0;

    generationResult.schedules.forEach(schedule => {
      Object.values(schedule.schedule).forEach(day => {
        Object.values(day).forEach(slot => {
          totalSlots++;
          if (slot?.classId) {
            filledSlots++;
          }
        });
      });
    });

    const emptySlots = totalSlots - filledSlots;

    return {
      totalSlots,
      filledSlots,
      emptySlots,
      fillRate: totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
    };
  };

  const stats = getGenerationStats();

  return (
    <div className="spacing-corporate">
      {/* Header */}
      <div className="card-corporate spacing-corporate mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-corporate-title">Otomatik Program Oluşturucu</h1>
              <p className="text-corporate-subtitle mt-1">Akıllı algoritma ile optimize edilmiş ders programları oluşturun</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowOptionsModal(true)}
              icon={Settings}
            >
              Ayarlar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              icon={isGenerating ? undefined : Play}
              variant="primary"
              className="min-w-[160px]"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  <span>Oluşturuluyor...</span>
                </div>
              ) : (
                'Program Oluştur'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Data Overview */}
      <div className="grid-corporate grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Öğretmenler</p>
              <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Building className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sınıflar</p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Dersler</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Mevcut Programlar</p>
              <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generation Result */}
      {generationResult && stats && (
        <div className="card-corporate spacing-corporate mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Oluşturma Sonucu</h2>
            <div className="flex items-center space-x-2">
              {generationResult.success ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              <span className={`text-sm font-medium ${
                generationResult.success ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {generationResult.success ? 'Başarılı' : 'Kısmi Başarı'}
              </span>
            </div>
          </div>

          <div className="grid-corporate grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{stats.totalSlots}</p>
              <p className="text-sm text-gray-600">Toplam Slot</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <p className="text-2xl font-bold text-emerald-600">{stats.filledSlots}</p>
              <p className="text-sm text-gray-600">Dolu Slot</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-2xl font-bold text-red-600">{stats.emptySlots}</p>
              <p className="text-sm text-gray-600">Boş Slot</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{stats.fillRate}%</p>
              <p className="text-sm text-gray-600">Doluluk Oranı</p>
            </div>
          </div>

          {generationResult.warnings.length > 0 && (
            <div className="notification-warning mb-6">
              <h3 className="text-sm font-medium mb-2">Uyarılar:</h3>
              <ul className="text-sm space-y-1">
                {generationResult.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={handleSaveSchedule}
              icon={Download}
              variant="success"
            >
              Programları Kaydet
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowResultModal(true)}
            >
              Detayları Görüntüle
            </Button>
          </div>
        </div>
      )}

      {/* Options Modal */}
      <Modal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        title="Oluşturma Ayarları"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Günlük Maksimum Ders Saati
            </label>
            <Select
              label=""
              value={generationOptions.maxDailyHours.toString()}
              onChange={(value) => setGenerationOptions(prev => ({
                ...prev,
                maxDailyHours: parseInt(value)
              }))}
              options={[
                { value: '6', label: '6 Ders' },
                { value: '7', label: '7 Ders' },
                { value: '8', label: '8 Ders' },
                { value: '9', label: '9 Ders' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dağılım Modu
            </label>
            <Select
              label=""
              value={generationOptions.mode}
              onChange={(value) => setGenerationOptions(prev => ({
                ...prev,
                mode: value as GenerationOptions['mode']
              }))}
              options={[
                { value: 'balanced', label: 'Dengeli Dağılım' },
                { value: 'compact', label: 'Sıkışık Program' },
                { value: 'spread', label: 'Yayılmış Program' }
              ]}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Tercihler</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={generationOptions.avoidConsecutive}
                  onChange={(e) => setGenerationOptions(prev => ({
                    ...prev,
                    avoidConsecutive: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Peş peşe aynı dersi engelle</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={generationOptions.prioritizeCore}
                  onChange={(e) => setGenerationOptions(prev => ({
                    ...prev,
                    prioritizeCore: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Ana dersleri önceliklendir</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={generationOptions.respectTimeSlots}
                  onChange={(e) => setGenerationOptions(prev => ({
                    ...prev,
                    respectTimeSlots: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Zaman dilimlerini dikkate al</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={generationOptions.preferMorningHours}
                  onChange={(e) => setGenerationOptions(prev => ({
                    ...prev,
                    preferMorningHours: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Sabah saatlerini tercih et</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setShowOptionsModal(false)}
            >
              İptal
            </Button>
            <Button
              onClick={() => setShowOptionsModal(false)}
              variant="primary"
            >
              Ayarları Uygula
            </Button>
          </div>
        </div>
      </Modal>

      {/* Result Details Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="Program Oluşturma Detayları"
        size="lg"
      >
        {generationResult && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Atanan Öğretmenler</h3>
                <p className="text-lg font-semibold">{generationResult.statistics.teachersAssigned}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Atanan Sınıflar</h3>
                <p className="text-lg font-semibold">{generationResult.statistics.classesAssigned}</p>
              </div>
            </div>

            {generationResult.warnings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Uyarılar</h3>
                <div className="notification-warning">
                  <ul className="text-sm space-y-1">
                    {generationResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {generationResult.conflicts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Çakışmalar</h3>
                <div className="notification-error">
                  <ul className="text-sm space-y-1">
                    {generationResult.conflicts.map((conflict, index) => (
                      <li key={index}>• {conflict}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Oluşturulan Programlar Önizlemesi</h3>
              <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                <div className="text-sm">
                  <p className="font-medium mb-2">
                    {generationResult.schedules.length} öğretmen programı oluşturuldu
                  </p>
                  {generationResult.schedules.slice(0, 3).map((schedule, index) => {
                    const teacher = teachers.find(t => t.id === schedule.teacherId);
                    const slotCount = Object.values(schedule.schedule).reduce((total, day) => 
                      total + Object.keys(day).length, 0
                    );
                    
                    return (
                      <div key={index} className="py-1">
                        <span className="font-medium">{teacher?.name || 'Bilinmeyen Öğretmen'}</span>: {slotCount} slot
                      </div>
                    );
                  })}
                  {generationResult.schedules.length > 3 && (
                    <p className="text-gray-500 mt-2">
                      ... ve {generationResult.schedules.length - 3} program daha
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setShowResultModal(false)}
              >
                Kapat
              </Button>
              <Button
                onClick={handleSaveSchedule}
                variant="success"
                icon={Download}
              >
                Programları Kaydet
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        type={confirmation.type}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        confirmVariant={confirmation.confirmVariant}
      />
    </div>
  );
};

export default AutoScheduleGenerator;
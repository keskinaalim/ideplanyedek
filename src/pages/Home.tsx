import React from 'react';
import { 
  Users, 
  Building, 
  BookOpen, 
  Calendar, 
  FileText, 
  Eye,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Dersler',
      description: 'Dersleri branş ve seviyelerine göre organize edin',
      color: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      path: '/subjects'
    },
    {
      icon: Users,
      title: 'Öğretmenler',
      description: 'Öğretmenleri ekleyin ve branşlarına göre yönetin',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/teachers'
    },
    {
      icon: Building,
      title: 'Sınıflar',
      description: 'Sınıfları seviyelerine göre kategorize edin',
      color: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      path: '/classes'
    },
    {
      icon: Calendar,
      title: 'Program Oluştur',
      description: 'Öğretmen veya sınıf bazlı ders programları oluşturun',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      path: '/schedules'
    },
    {
      icon: Zap,
      title: 'Otomatik Program',
      description: 'Akıllı algoritma ile otomatik program oluşturun',
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
      path: '/auto-schedule'
    },
    {
      icon: Eye,
      title: 'Programları Görüntüle',
      description: 'Oluşturulan programları görüntüleyin ve inceleyin',
      color: 'bg-pink-100',
      iconColor: 'text-pink-600',
      path: '/all-schedules'
    },
    {
      icon: FileText,
      title: 'PDF İndir',
      description: 'Programları profesyonel PDF formatında indirin',
      color: 'bg-amber-100',
      iconColor: 'text-amber-600',
      path: '/pdf'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="spacing-corporate">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center">
              <img 
                src="https://cv.ide.k12.tr/images/ideokullari_logo.png" 
                alt="İDE Okulları Logo"
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-12 h-12 text-blue-600 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>';
                  }
                }}
              />
            </div>
          </div>
          
          <h1 className="text-corporate-title mb-4">
            İDE Okulları Ders Programı Sistemi
          </h1>
          <p className="text-corporate-subtitle mb-8 max-w-2xl mx-auto">
            Modern, kullanıcı dostu ve güvenilir ders programı yönetim sistemi. 
            Çakışma kontrolü, otomatik saatler ve profesyonel çıktılar ile okul yönetiminizi kolaylaştırın.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="spacing-corporate">
        <div className="grid-corporate grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.path)}
              className="card-corporate spacing-corporate cursor-pointer group hover:scale-105 transition-all duration-300"
            >
              <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-corporate-body mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-200">
                Başla <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Overview */}
      <div className="spacing-corporate">
        <div className="card-corporate spacing-corporate">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sistem Özellikleri</h2>
            <p className="text-corporate-subtitle">Profesyonel okul yönetimi için gelişmiş özellikler</p>
          </div>
          
          <div className="grid-corporate grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Çakışma Kontrolü</h3>
              <p className="text-sm text-gray-600">Otomatik çakışma tespiti ve uyarı sistemi</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">PDF Çıktı</h3>
              <p className="text-sm text-gray-600">Profesyonel görünümlü PDF raporları</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Otomatik Program</h3>
              <p className="text-sm text-gray-600">Akıllı algoritma ile program oluşturma</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Güvenli Saklama</h3>
              <p className="text-sm text-gray-600">Firebase altyapısı ile güvenli veri yönetimi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="spacing-corporate text-center">
        <div className="card-corporate spacing-corporate bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Hemen Başlayın</h3>
          <p className="text-gray-600 mb-6">Modern okul yönetimi için tasarlanmış profesyonel çözüm</p>
          <Button
            onClick={() => navigate('/subjects')}
            variant="primary"
            size="lg"
            icon={ArrowRight}
          >
            Sistemi Keşfet
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
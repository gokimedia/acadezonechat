// scripts/seed-data.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Modelleri tanımla
const DepartmentSchema = new mongoose.Schema({
  name: String,
  slug: String,
  createdAt: { type: Date, default: Date.now }
});

const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  url: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const CampaignSchema = new mongoose.Schema({
  title: String,
  description: String,
  discountRate: Number,
  expiryDate: Date,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  createdAt: { type: Date, default: Date.now }
});

const QuestionSchema = new mongoose.Schema({
  text: String,
  orderNum: Number,
  createdAt: { type: Date, default: Date.now }
});

const OptionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  text: String,
  nextQuestion: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  createdAt: { type: Date, default: Date.now }
});

const RecommendationSchema = new mongoose.Schema({
  option: { type: mongoose.Schema.Types.ObjectId, ref: 'Option' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  createdAt: { type: Date, default: Date.now }
});

const ChatbotSettingsSchema = new mongoose.Schema({
  name: { type: String, default: 'AcadeZone Eğitim Asistanı' },
  primaryColor: { type: String, default: '#3498db' },
  secondaryColor: { type: String, default: '#2980b9' },
  welcomeMessage: { type: String, default: 'Merhaba! AcadeZone Eğitim Asistanı\'na hoş geldiniz. Size en uygun eğitim programlarını bulmak için yardımcı olabilirim.' },
  logoUrl: { type: String, default: '' },
  active: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

// Modelleri oluştur
const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
const Option = mongoose.models.Option || mongoose.model('Option', OptionSchema);
const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema);
const ChatbotSettings = mongoose.models.ChatbotSettings || mongoose.model('ChatbotSettings', ChatbotSettingsSchema);

async function seedData() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB bağlantısı başarılı');

    // Koleksiyonları temizle
    await Department.deleteMany({});
    await Course.deleteMany({});
    await Campaign.deleteMany({});
    await Question.deleteMany({});
    await Option.deleteMany({});
    await Recommendation.deleteMany({});
    await ChatbotSettings.deleteMany({});

    console.log('Koleksiyonlar temizlendi');

    // 1. Varsayılan Chatbot ayarlarını oluştur
    const chatbotSettings = new ChatbotSettings({
      name: 'AcadeZone Eğitim Asistanı',
      primaryColor: '#3498db',
      secondaryColor: '#2980b9',
      welcomeMessage: 'Merhaba! AcadeZone Eğitim Asistanı\'na hoş geldiniz. Size en uygun eğitim programlarını bulmak için yardımcı olabilirim.',
      logoUrl: '',
      active: true
    });

    await chatbotSettings.save();
    console.log('Chatbot ayarları oluşturuldu');

    // 2. Bölümleri oluştur
    const departments = [
      { name: 'Beslenme ve Diyetetik', slug: 'beslenme-diyetetik' },
      { name: 'Biyomedikal Mühendisliği', slug: 'biyomedikal-muhendisligi' },
      { name: 'Bilgisayar Mühendisliği', slug: 'bilgisayar-muhendisligi' },
      { name: 'Psikoloji', slug: 'psikoloji' },
      { name: 'Fizyoterapi', slug: 'fizyoterapi' }
    ];

    const savedDepartments = await Department.insertMany(departments);
    console.log('Bölümler oluşturuldu');

    // Bölüm ID'lerini referans olarak tut
    const departmentMap = {};
    savedDepartments.forEach(dept => {
      departmentMap[dept.name] = dept._id;
    });

    // 3. Kursları oluştur
    const courses = [
      // Beslenme ve Diyetetik kursları
      {
        title: 'Klinik Beslenme Sertifika Programı',
        description: 'Hastane beslenme uzmanı olarak çalışmak isteyenler için Başlangıç seviyesinde sertifika programı. Haftada 5-10 saat çalışma gerektirir.',
        department: departmentMap['Beslenme ve Diyetetik'],
        url: 'https://acadezone.com/bolumler/beslenme-diyetetik-sertifikali-egitim-programlari/klinik-beslenme',
        imageUrl: '/images/courses/clinical-nutrition.jpg'
      },
      {
        title: 'Sporcu Beslenmesi Uzmanlık Programı',
        description: 'Sporcular için özel beslenme programları ve takviyeler konusunda İleri seviye uzmanlık programı. Akademik kariyer düşünenler için idealdir.',
        department: departmentMap['Beslenme ve Diyetetik'],
        url: 'https://acadezone.com/bolumler/beslenme-diyetetik-sertifikali-egitim-programlari/sporcu-beslenmesi',
        imageUrl: '/images/courses/sports-nutrition.jpg'
      },
      {
        title: 'Vegan ve Vejetaryen Beslenme Danışmanlığı',
        description: 'Vegan ve vejetaryen beslenme danışmanlığı için Orta seviye sertifika programı. Uzaktan eğitim seçeneği mevcuttur.',
        department: departmentMap['Beslenme ve Diyetetik'],
        url: 'https://acadezone.com/bolumler/beslenme-diyetetik-sertifikali-egitim-programlari/vegan-beslenme',
        imageUrl: '/images/courses/vegan-nutrition.jpg'
      },
      
      // Biyomedikal Mühendisliği kursları
      {
        title: 'Tıbbi Cihaz Tasarımı ve Regülasyonları',
        description: 'Tıbbi cihaz tasarımı ve uluslararası regülasyonlar hakkında Orta seviye sertifika programı. Yüz yüze eğitim içerir.',
        department: departmentMap['Biyomedikal Mühendisliği'],
        url: 'https://acadezone.com/bolumler/biyomedikal-muhendisligi/tibbi-cihaz-tasarimi',
        imageUrl: '/images/courses/medical-device.jpg'
      },
      {
        title: 'Biyomedikal Sinyal İşleme',
        description: 'EEG, EMG ve EKG gibi biyomedikal sinyallerin işlenmesi için İleri seviye uzmanlık programı. Akademik kariyer için idealdir.',
        department: departmentMap['Biyomedikal Mühendisliği'],
        url: 'https://acadezone.com/bolumler/biyomedikal-muhendisligi/biyomedikal-sinyal-isleme',
        imageUrl: '/images/courses/biomedical-signals.jpg'
      },
      {
        title: 'Yapay Zeka ve Sağlık Uygulamaları',
        description: 'Sağlık alanında yapay zeka kullanımı için Başlangıç seviye sertifika programı. Esnek çalışma saatleri.',
        department: departmentMap['Biyomedikal Mühendisliği'],
        url: 'https://acadezone.com/bolumler/biyomedikal-muhendisligi/yapay-zeka-saglik',
        imageUrl: '/images/courses/ai-health.jpg'
      },
      
      // Bilgisayar Mühendisliği kursları
      {
        title: 'Web Geliştirme Bootcamp',
        description: 'Modern web teknolojileri ve uygulamaları için Başlangıç seviye yoğun eğitim programı. Haftada 10+ saat gerektirir.',
        department: departmentMap['Bilgisayar Mühendisliği'],
        url: 'https://acadezone.com/bolumler/bilgisayar-muhendisligi/web-gelistirme-bootcamp',
        imageUrl: '/images/courses/web-dev.jpg'
      },
      {
        title: 'Veri Bilimi ve Machine Learning',
        description: 'Veri analizi ve makine öğrenmesi için Orta seviye sertifika programı. Uzaktan eğitim seçeneği mevcuttur.',
        department: departmentMap['Bilgisayar Mühendisliği'],
        url: 'https://acadezone.com/bolumler/bilgisayar-muhendisligi/veri-bilimi',
        imageUrl: '/images/courses/data-science.jpg'
      },
      {
        title: 'Siber Güvenlik Uzmanlığı',
        description: 'Siber güvenlik alanında İleri seviye uzmanlık programı. Akademik kariyer veya sertifikasyon için idealdir.',
        department: departmentMap['Bilgisayar Mühendisliği'],
        url: 'https://acadezone.com/bolumler/bilgisayar-muhendisligi/siber-guvenlik',
        imageUrl: '/images/courses/cybersecurity.jpg'
      }
    ];

    const savedCourses = await Course.insertMany(courses);
    console.log('Kurslar oluşturuldu');

    // Kurs ID'lerini referans olarak tut
    const courseMap = {};
    savedCourses.forEach(course => {
      courseMap[course.title] = course._id;
    });

    // 4. Kampanyaları oluştur
    const today = new Date();
    const campaigns = [
      {
        title: 'Erken Kayıt İndirimi',
        description: 'Erken kayıt yaptıranlara özel %25 indirim fırsatı',
        discountRate: 25,
        expiryDate: new Date(today.setDate(today.getDate() + 30)),
        course: courseMap['Klinik Beslenme Sertifika Programı']
      },
      {
        title: 'Yaz Okulu Kampanyası',
        description: 'Yaz dönemi için özel fiyatlar',
        discountRate: 15,
        expiryDate: new Date(today.setDate(today.getDate() + 60)),
        course: courseMap['Tıbbi Cihaz Tasarımı ve Regülasyonları']
      },
      {
        title: 'İkili Kayıt Avantajı',
        description: 'İki program birden kayıt olanlara %40 indirim',
        discountRate: 40,
        expiryDate: new Date(today.setDate(today.getDate() + 15)),
        course: courseMap['Web Geliştirme Bootcamp']
      }
    ];

    await Campaign.insertMany(campaigns);
    console.log('Kampanyalar oluşturuldu');

    // 5. Soruları oluştur
    const questions = [
      { text: 'Hangi bölümle ilgileniyorsunuz?', orderNum: 1 },
      { text: 'Hangi alanlara ilgi duyuyorsunuz?', orderNum: 2 },
      { text: 'Hangi seviyede eğitim arıyorsunuz?', orderNum: 3 },
      { text: 'Eğitim için ne kadar zaman ayırabilirsiniz?', orderNum: 4 }
    ];

    const savedQuestions = await Question.insertMany(questions);
    console.log('Sorular oluşturuldu');

    // Soru ID'lerini referans olarak tut
    const questionMap = {};
    savedQuestions.forEach(question => {
      questionMap[question.orderNum] = question._id;
    });

    // 6. Seçenekleri oluştur
    const options = [
      // Bölüm sorusu seçenekleri
      { question: questionMap[1], text: 'Beslenme ve Diyetetik', nextQuestion: questionMap[2] },
      { question: questionMap[1], text: 'Biyomedikal Mühendisliği', nextQuestion: questionMap[2] },
      { question: questionMap[1], text: 'Bilgisayar Mühendisliği', nextQuestion: questionMap[2] },
      { question: questionMap[1], text: 'Psikoloji', nextQuestion: questionMap[2] },
      { question: questionMap[1], text: 'Diğer', nextQuestion: questionMap[2] },

      // İlgi alanı sorusu seçenekleri
      { question: questionMap[2], text: 'Akademik Kariyer', nextQuestion: questionMap[3] },
      { question: questionMap[2], text: 'Sertifika Programları', nextQuestion: questionMap[3] },
      { question: questionMap[2], text: 'Uzaktan Eğitim', nextQuestion: questionMap[3] },
      { question: questionMap[2], text: 'Yüz Yüze Eğitim', nextQuestion: questionMap[3] },
      { question: questionMap[2], text: 'Hepsi', nextQuestion: questionMap[3] },

      // Seviye sorusu seçenekleri
      { question: questionMap[3], text: 'Başlangıç', nextQuestion: questionMap[4] },
      { question: questionMap[3], text: 'Orta', nextQuestion: questionMap[4] },
      { question: questionMap[3], text: 'İleri', nextQuestion: questionMap[4] },
      { question: questionMap[3], text: 'Hepsi', nextQuestion: questionMap[4] },

      // Zaman sorusu seçenekleri
      { question: questionMap[4], text: 'Haftada 2-4 saat', nextQuestion: null },
      { question: questionMap[4], text: 'Haftada 5-10 saat', nextQuestion: null },
      { question: questionMap[4], text: 'Haftada 10+ saat', nextQuestion: null },
      { question: questionMap[4], text: 'Esnek', nextQuestion: null }
    ];

    const savedOptions = await Option.insertMany(options);
    console.log('Seçenekler oluşturuldu');

    // Seçenek ID'lerini referans olarak tut
    const optionMap = {};
    savedOptions.forEach((option, index) => {
      optionMap[index + 1] = option._id;
    });

    // 7. Önerileri oluştur
    const recommendations = [
      // Beslenme bölümü önerileri
      { option: optionMap[16], course: courseMap['Klinik Beslenme Sertifika Programı'] }, // Haftada 5-10 saat -> Klinik Beslenme
      { option: optionMap[11], course: courseMap['Sporcu Beslenmesi Uzmanlık Programı'] }, // İleri seviye -> Sporcu Beslenmesi
      { option: optionMap[15], course: courseMap['Vegan ve Vejetaryen Beslenme Danışmanlığı'] }, // Haftada 2-4 saat -> Vegan Beslenme

      // Biyomedikal önerileri
      { option: optionMap[12], course: courseMap['Tıbbi Cihaz Tasarımı ve Regülasyonları'] }, // Orta seviye -> Tıbbi Cihaz Tasarımı
      { option: optionMap[11], course: courseMap['Biyomedikal Sinyal İşleme'] }, // İleri seviye -> Biyomedikal Sinyal İşleme
      { option: optionMap[18], course: courseMap['Yapay Zeka ve Sağlık Uygulamaları'] }, // Esnek -> Yapay Zeka ve Sağlık

      // Bilgisayar Mühendisliği önerileri
      { option: optionMap[17], course: courseMap['Web Geliştirme Bootcamp'] }, // Haftada 10+ saat -> Web Geliştirme
      { option: optionMap[15], course: courseMap['Veri Bilimi ve Machine Learning'] }, // Haftada 2-4 saat -> Veri Bilimi
      { option: optionMap[11], course: courseMap['Siber Güvenlik Uzmanlığı'] }  // İleri seviye -> Siber Güvenlik
    ];

    await Recommendation.insertMany(recommendations);
    console.log('Öneriler oluşturuldu');

    console.log('Tüm veriler başarıyla oluşturuldu!');

    // MongoDB bağlantısını kapat
    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('Veri oluşturma hatası:', error);
    process.exit(1);
  }
}

// Verileri oluştur
seedData();
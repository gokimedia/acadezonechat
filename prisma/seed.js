// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Veritabanı seed işlemi başlatılıyor...');

  // Admin kullanıcısı oluştur
  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('355235gG!', salt);
    
    await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'yonetim@acadezone.com',
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('Admin kullanıcısı oluşturuldu:');
    console.log('Email: yonetim@acadezone.com');
    console.log('Şifre: 355235gG!');
  } else {
    console.log('Admin kullanıcısı zaten var.');
  }

  // Chatbot ayarlarını oluştur
  const settingsCount = await prisma.chatbotSetting.count();
  if (settingsCount === 0) {
    await prisma.chatbotSetting.create({
      data: {
        name: 'AcadeZone Eğitim Asistanı',
        primaryColor: '#3498db',
        secondaryColor: '#2980b9',
        welcomeMessage: 'Merhaba! AcadeZone Eğitim Asistanı\'na hoş geldiniz. Size en uygun eğitim programlarını bulmak için yardımcı olabilirim.',
        logoUrl: '',
        active: true
      }
    });
    
    console.log('Chatbot ayarları oluşturuldu.');
  } else {
    console.log('Chatbot ayarları zaten var.');
  }

  // Bölümleri oluştur
  const departments = [
    { name: 'Beslenme ve Diyetetik', slug: 'beslenme-diyetetik' },
    { name: 'Biyomedikal Mühendisliği', slug: 'biyomedikal-muhendisligi' },
    { name: 'Bilgisayar Mühendisliği', slug: 'bilgisayar-muhendisligi' },
    { name: 'Psikoloji', slug: 'psikoloji' },
    { name: 'Fizyoterapi', slug: 'fizyoterapi' }
  ];

  const departmentMap = {};
  for (const dept of departments) {
    const existingDept = await prisma.department.findFirst({
      where: { slug: dept.slug }
    });
    
    if (!existingDept) {
      const result = await prisma.department.create({
        data: {
          name: dept.name,
          slug: dept.slug
        }
      });
      departmentMap[dept.name] = result.id;
      console.log(`"${dept.name}" bölümü oluşturuldu`);
    } else {
      departmentMap[dept.name] = existingDept.id;
      console.log(`"${dept.name}" bölümü zaten var`);
    }
  }

  // Kursları oluştur
  const courses = [
    // Beslenme ve Diyetetik kursları
    {
      title: 'Klinik Beslenme Sertifika Programı',
      description: 'Hastane beslenme uzmanı olarak çalışmak isteyenler için Başlangıç seviyesinde sertifika programı. Haftada 5-10 saat çalışma gerektirir.',
      departmentId: departmentMap['Beslenme ve Diyetetik'],
      url: 'https://acadezone.com/bolumler/beslenme-diyetetik-sertifikali-egitim-programlari/klinik-beslenme',
      imageUrl: '/images/courses/clinical-nutrition.jpg'
    },
    {
      title: 'Sporcu Beslenmesi Uzmanlık Programı',
      description: 'Sporcular için özel beslenme programları ve takviyeler konusunda İleri seviye uzmanlık programı. Akademik kariyer düşünenler için idealdir.',
      departmentId: departmentMap['Beslenme ve Diyetetik'],
      url: 'https://acadezone.com/bolumler/beslenme-diyetetik-sertifikali-egitim-programlari/sporcu-beslenmesi',
      imageUrl: '/images/courses/sports-nutrition.jpg'
    },
    {
      title: 'Vegan ve Vejetaryen Beslenme Danışmanlığı',
      description: 'Vegan ve vejetaryen beslenme danışmanlığı için Orta seviye sertifika programı. Uzaktan eğitim seçeneği mevcuttur.',
      departmentId: departmentMap['Beslenme ve Diyetetik'],
      url: 'https://acadezone.com/bolumler/beslenme-diyetetik-sertifikali-egitim-programlari/vegan-beslenme',
      imageUrl: '/images/courses/vegan-nutrition.jpg'
    },
    
    // Biyomedikal Mühendisliği kursları
    {
      title: 'Tıbbi Cihaz Tasarımı ve Regülasyonları',
      description: 'Tıbbi cihaz tasarımı ve uluslararası regülasyonlar hakkında Orta seviye sertifika programı. Yüz yüze eğitim içerir.',
      departmentId: departmentMap['Biyomedikal Mühendisliği'],
      url: 'https://acadezone.com/bolumler/biyomedikal-muhendisligi/tibbi-cihaz-tasarimi',
      imageUrl: '/images/courses/medical-device.jpg'
    },
    {
      title: 'Biyomedikal Sinyal İşleme',
      description: 'EEG, EMG ve EKG gibi biyomedikal sinyallerin işlenmesi için İleri seviye uzmanlık programı. Akademik kariyer için idealdir.',
      departmentId: departmentMap['Biyomedikal Mühendisliği'],
      url: 'https://acadezone.com/bolumler/biyomedikal-muhendisligi/biyomedikal-sinyal-isleme',
      imageUrl: '/images/courses/biomedical-signals.jpg'
    },
    {
      title: 'Yapay Zeka ve Sağlık Uygulamaları',
      description: 'Sağlık alanında yapay zeka kullanımı için Başlangıç seviye sertifika programı. Esnek çalışma saatleri.',
      departmentId: departmentMap['Biyomedikal Mühendisliği'],
      url: 'https://acadezone.com/bolumler/biyomedikal-muhendisligi/yapay-zeka-saglik',
      imageUrl: '/images/courses/ai-health.jpg'
    },
    
    // Bilgisayar Mühendisliği kursları
    {
      title: 'Web Geliştirme Bootcamp',
      description: 'Modern web teknolojileri ve uygulamaları için Başlangıç seviye yoğun eğitim programı. Haftada 10+ saat gerektirir.',
      departmentId: departmentMap['Bilgisayar Mühendisliği'],
      url: 'https://acadezone.com/bolumler/bilgisayar-muhendisligi/web-gelistirme-bootcamp',
      imageUrl: '/images/courses/web-dev.jpg'
    },
    {
      title: 'Veri Bilimi ve Machine Learning',
      description: 'Veri analizi ve makine öğrenmesi için Orta seviye sertifika programı. Uzaktan eğitim seçeneği mevcuttur.',
      departmentId: departmentMap['Bilgisayar Mühendisliği'],
      url: 'https://acadezone.com/bolumler/bilgisayar-muhendisligi/veri-bilimi',
      imageUrl: '/images/courses/data-science.jpg'
    },
    {
      title: 'Siber Güvenlik Uzmanlığı',
      description: 'Siber güvenlik alanında İleri seviye uzmanlık programı. Akademik kariyer veya sertifikasyon için idealdir.',
      departmentId: departmentMap['Bilgisayar Mühendisliği'],
      url: 'https://acadezone.com/bolumler/bilgisayar-muhendisligi/siber-guvenlik',
      imageUrl: '/images/courses/cybersecurity.jpg'
    }
  ];

  const courseMap = {};
  for (const course of courses) {
    const existingCourse = await prisma.course.findFirst({ 
      where: { 
        title: course.title,
        departmentId: course.departmentId 
      }
    });
    
    if (!existingCourse) {
      const result = await prisma.course.create({
        data: course
      });
      courseMap[course.title] = result.id;
      console.log(`"${course.title}" kursu oluşturuldu`);
    } else {
      courseMap[course.title] = existingCourse.id;
      console.log(`"${course.title}" kursu zaten var`);
    }
  }

  // Kampanyaları oluştur
  const today = new Date();
  const campaigns = [
    {
      title: 'Erken Kayıt İndirimi',
      description: 'Erken kayıt yaptıranlara özel %25 indirim fırsatı',
      discountRate: 25,
      expiryDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      courseId: courseMap['Klinik Beslenme Sertifika Programı']
    },
    {
      title: 'Yaz Okulu Kampanyası',
      description: 'Yaz dönemi için özel fiyatlar',
      discountRate: 15,
      expiryDate: new Date(today.getFullYear(), today.getMonth() + 2, today.getDate()),
      courseId: courseMap['Tıbbi Cihaz Tasarımı ve Regülasyonları']
    },
    {
      title: 'İkili Kayıt Avantajı',
      description: 'İki program birden kayıt olanlara %40 indirim',
      discountRate: 40,
      expiryDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15),
      courseId: courseMap['Web Geliştirme Bootcamp']
    }
  ];

  for (const campaign of campaigns) {
    if (!campaign.courseId) continue;
    
    const existingCampaign = await prisma.campaign.findFirst({ 
      where: { 
        title: campaign.title,
        courseId: campaign.courseId 
      }
    });
    
    if (!existingCampaign) {
      await prisma.campaign.create({
        data: campaign
      });
      console.log(`"${campaign.title}" kampanyası oluşturuldu`);
    } else {
      console.log(`"${campaign.title}" kampanyası zaten var`);
    }
  }

  // Soruları oluştur
  const questions = [
    { text: 'Hangi bölümle ilgileniyorsunuz?', orderNum: 1 },
    { text: 'Hangi alanlara ilgi duyuyorsunuz?', orderNum: 2 },
    { text: 'Hangi seviyede eğitim arıyorsunuz?', orderNum: 3 },
    { text: 'Eğitim için ne kadar zaman ayırabilirsiniz?', orderNum: 4 }
  ];

  const questionMap = {};
  for (const question of questions) {
    const existingQuestion = await prisma.question.findFirst({
      where: { orderNum: question.orderNum }
    });
    
    if (!existingQuestion) {
      const result = await prisma.question.create({
        data: question
      });
      questionMap[question.orderNum] = result.id;
      console.log(`Soru #${question.orderNum} oluşturuldu`);
    } else {
      questionMap[question.orderNum] = existingQuestion.id;
      console.log(`Soru #${question.orderNum} zaten var`);
    }
  }

  // Seçenekleri oluştur (önce mevcut seçenekleri temizle)
  await prisma.option.deleteMany({});
  console.log('Mevcut seçenekler temizlendi');

  const options = [
    // Bölüm sorusu seçenekleri
    { questionId: questionMap[1], text: 'Beslenme ve Diyetetik', nextQuestionId: questionMap[2] },
    { questionId: questionMap[1], text: 'Biyomedikal Mühendisliği', nextQuestionId: questionMap[2] },
    { questionId: questionMap[1], text: 'Bilgisayar Mühendisliği', nextQuestionId: questionMap[2] },
    { questionId: questionMap[1], text: 'Psikoloji', nextQuestionId: questionMap[2] },
    { questionId: questionMap[1], text: 'Diğer', nextQuestionId: questionMap[2] },

    // İlgi alanı sorusu seçenekleri
    { questionId: questionMap[2], text: 'Akademik Kariyer', nextQuestionId: questionMap[3] },
    { questionId: questionMap[2], text: 'Sertifika Programları', nextQuestionId: questionMap[3] },
    { questionId: questionMap[2], text: 'Uzaktan Eğitim', nextQuestionId: questionMap[3] },
    { questionId: questionMap[2], text: 'Yüz Yüze Eğitim', nextQuestionId: questionMap[3] },
    { questionId: questionMap[2], text: 'Hepsi', nextQuestionId: questionMap[3] },

    // Seviye sorusu seçenekleri
    { questionId: questionMap[3], text: 'Başlangıç', nextQuestionId: questionMap[4] },
    { questionId: questionMap[3], text: 'Orta', nextQuestionId: questionMap[4] },
    { questionId: questionMap[3], text: 'İleri', nextQuestionId: questionMap[4] },
    { questionId: questionMap[3], text: 'Hepsi', nextQuestionId: questionMap[4] },

    // Zaman sorusu seçenekleri
    { questionId: questionMap[4], text: 'Haftada 2-4 saat', nextQuestionId: null },
    { questionId: questionMap[4], text: 'Haftada 5-10 saat', nextQuestionId: null },
    { questionId: questionMap[4], text: 'Haftada 10+ saat', nextQuestionId: null },
    { questionId: questionMap[4], text: 'Esnek', nextQuestionId: null }
  ];

  const optionCreations = await Promise.all(
    options.map(option => prisma.option.create({ data: option }))
  );
  
  const optionIds = optionCreations.map(option => option.id);
  console.log('Seçenekler oluşturuldu');

  // Önerileri oluştur
  await prisma.recommendation.deleteMany({});
  console.log('Mevcut öneriler temizlendi');

  // Öneriler için veri hazırlama
  const recommendationsData = [];
  
  // İndeksleri yeniden ayarla
  // Beslenme ve Diyetetik kursları
  if (optionIds[15] && courseMap['Klinik Beslenme Sertifika Programı']) {
    recommendationsData.push({ 
      optionId: optionIds[15], 
      courseId: courseMap['Klinik Beslenme Sertifika Programı'] 
    }); // Haftada 5-10 saat -> Klinik Beslenme
  }
  
  if (optionIds[12] && courseMap['Sporcu Beslenmesi Uzmanlık Programı']) {
    recommendationsData.push({ 
      optionId: optionIds[12], 
      courseId: courseMap['Sporcu Beslenmesi Uzmanlık Programı'] 
    }); // İleri seviye -> Sporcu Beslenmesi
  }
  
  if (optionIds[14] && courseMap['Vegan ve Vejetaryen Beslenme Danışmanlığı']) {
    recommendationsData.push({ 
      optionId: optionIds[14], 
      courseId: courseMap['Vegan ve Vejetaryen Beslenme Danışmanlığı'] 
    }); // Haftada 2-4 saat -> Vegan Beslenme
  }

  // Biyomedikal önerileri
  if (optionIds[11] && courseMap['Tıbbi Cihaz Tasarımı ve Regülasyonları']) {
    recommendationsData.push({ 
      optionId: optionIds[11], 
      courseId: courseMap['Tıbbi Cihaz Tasarımı ve Regülasyonları'] 
    }); // Orta seviye -> Tıbbi Cihaz Tasarımı
  }
  
  if (optionIds[12] && courseMap['Biyomedikal Sinyal İşleme']) {
    recommendationsData.push({ 
      optionId: optionIds[12], 
      courseId: courseMap['Biyomedikal Sinyal İşleme'] 
    }); // İleri seviye -> Biyomedikal Sinyal İşleme
  }
  
  if (optionIds[17] && courseMap['Yapay Zeka ve Sağlık Uygulamaları']) {
    recommendationsData.push({ 
      optionId: optionIds[17], 
      courseId: courseMap['Yapay Zeka ve Sağlık Uygulamaları'] 
    }); // Esnek -> Yapay Zeka ve Sağlık
  }

  // Bilgisayar Mühendisliği önerileri
  if (optionIds[16] && courseMap['Web Geliştirme Bootcamp']) {
    recommendationsData.push({ 
      optionId: optionIds[16], 
      courseId: courseMap['Web Geliştirme Bootcamp'] 
    }); // Haftada 10+ saat -> Web Geliştirme
  }
  
  if (optionIds[14] && courseMap['Veri Bilimi ve Machine Learning']) {
    recommendationsData.push({ 
      optionId: optionIds[14], 
      courseId: courseMap['Veri Bilimi ve Machine Learning'] 
    }); // Haftada 2-4 saat -> Veri Bilimi
  }
  
  if (optionIds[12] && courseMap['Siber Güvenlik Uzmanlığı']) {
    recommendationsData.push({ 
      optionId: optionIds[12], 
      courseId: courseMap['Siber Güvenlik Uzmanlığı'] 
    }); // İleri seviye -> Siber Güvenlik
  }

  // Önerileri oluştur
  if (recommendationsData.length > 0) {
    await prisma.recommendation.createMany({
      data: recommendationsData
    });
    console.log('Öneriler oluşturuldu');
  } else {
    console.log('Oluşturulacak öneri bulunamadı');
  }

  console.log('Seed işlemi tamamlandı.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
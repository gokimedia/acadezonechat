// scripts/seed-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Admin modeli
const AdminSchema = new mongoose.Schema({
  username: {
    type: String, 
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor'],
    default: 'admin'
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seedAdmin() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut admin kullanıcısını kontrol et
    const existingAdmin = await Admin.findOne({ email: 'yonetim@acadezone.com' });
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut');
      await mongoose.connection.close();
      return;
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('355235gG!', salt);

    // Yeni admin kullanıcısı oluştur
    const admin = new Admin({
      username: 'admin',
      email: 'yonetim@acadezone.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Admin kullanıcısını kaydet
    await admin.save();
    console.log('Admin kullanıcısı başarıyla oluşturuldu');

    // MongoDB bağlantısını kapat
    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
    process.exit(1);
  }
}

// Admin kullanıcısı oluştur
seedAdmin();
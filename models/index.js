// models/index.js
import mongoose from 'mongoose';

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

// Kullanıcı modeli
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Bölüm modeli
const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Kurs modeli
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  url: {
    type: String
  },
  imageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Kampanya modeli
const CampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  discountRate: {
    type: Number
  },
  expiryDate: {
    type: Date
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Soru modeli
const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  orderNum: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Seçenek modeli
const OptionSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  text: {
    type: String,
    required: true
  },
  nextQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Öneri modeli
const RecommendationSchema = new mongoose.Schema({
  option: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Option'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Kullanıcı oturumu modeli
const UserSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  sessionData: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Chatbot ayarları modeli
const ChatbotSettingsSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'AcadeZone Eğitim Asistanı'
  },
  primaryColor: {
    type: String,
    default: '#3498db'
  },
  secondaryColor: {
    type: String,
    default: '#2980b9'
  },
  welcomeMessage: {
    type: String,
    default: 'Merhaba! AcadeZone Eğitim Asistanı\'na hoş geldiniz. Size en uygun eğitim programlarını bulmak için yardımcı olabilirim.'
  },
  logoUrl: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Chat analitik modeli
const ChatAnalyticsSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  messageCount: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  resultedInContact: {
    type: Boolean,
    default: false
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  pageUrl: {
    type: String
  },
  referrer: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Bilgi talebi modeli
const InformationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requestType: {
    type: String
  },
  status: {
    type: String,
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Başvuru talebi modeli
const ApplicationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requestType: {
    type: String
  },
  status: {
    type: String,
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Modelleri oluştur ve export et
export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
export const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
export const Option = mongoose.models.Option || mongoose.model('Option', OptionSchema);
export const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema);
export const UserSession = mongoose.models.UserSession || mongoose.model('UserSession', UserSessionSchema);
export const ChatbotSettings = mongoose.models.ChatbotSettings || mongoose.model('ChatbotSettings', ChatbotSettingsSchema);
export const ChatAnalytics = mongoose.models.ChatAnalytics || mongoose.model('ChatAnalytics', ChatAnalyticsSchema);
export const InformationRequest = mongoose.models.InformationRequest || mongoose.model('InformationRequest', InformationRequestSchema);
export const ApplicationRequest = mongoose.models.ApplicationRequest || mongoose.model('ApplicationRequest', ApplicationRequestSchema);
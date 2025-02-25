# AcadeZone Chatbot

AcadeZone için özel olarak geliştirilmiş WordPress entegrasyonlu eğitim asistanı chatbot.

## Özellikler

- Kullanıcı bilgilerini toplama ve kaydetme
- Kişiselleştirilmiş eğitim programı önerileri
- Admin paneli ile yönetim
- WordPress sitelere kolay entegrasyon
- Analitik ve raporlama

## Kurulum

Projeyi yerel ortamınızda kurmak ve çalıştırmak için aşağıdaki adımları izleyin:

### Önkoşullar

- Node.js (v14 veya daha yeni)
- npm veya yarn
- Git

### Adımlar

1. Projeyi klonlayın:

```bash
git clone https://github.com/yourusername/acadezone-chatbot.git
cd acadezone-chatbot
```

2. Bağımlılıkları yükleyin:

```bash
npm install
# veya
yarn install
```

3. Prisma istemcisini oluşturun:

```bash
npm run prisma:generate
# veya
yarn prisma:generate
```

4. Veritabanı şemasını oluşturun:

```bash
npm run prisma:push
# veya
yarn prisma:push
```

5. Örnek verileri yükleyin:

```bash
npm run seed
# veya
yarn seed
```

6. Geliştirme sunucusunu başlatın:

```bash
npm run dev
# veya
yarn dev
```

7. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek uygulamayı görüntüleyin.

## Admin Paneli

Admin paneline erişmek için:

1. [http://localhost:3000/admin](http://localhost:3000/admin) adresine gidin.
2. Giriş bilgilerini kullanın:
   - Email: `yonetim@acadezone.com`
   - Şifre: `355235gG!`

## WordPress Entegrasyonu

WordPress sitenize chatbot'u entegre etmek için:

1. Admin panelindeki "Embed Kodu" sayfasına gidin.
2. Kodunuzu kopyalayın.
3. WordPress sitenizin header.php dosyasına veya bir header scripts eklentisine ekleyin.

## Veritabanı Yönetimi

Prisma Studio ile veritabanını görsel olarak yönetebilirsiniz:

```bash
npm run prisma:studio
# veya
yarn prisma:studio
```

Bu komut, [http://localhost:5555](http://localhost:5555) adresinde bir arayüz başlatacaktır.

## Canlı Ortama Dağıtım

Projeyi Vercel'e dağıtmak için:

1. Vercel CLI'yı yükleyin:

```bash
npm install -g vercel
```

2. Projeyi dağıtın:

```bash
vercel
```

3. Ya da Vercel kontrol paneli üzerinden GitHub reponuzu bağlayabilirsiniz.

4. Çevre değişkenlerini Vercel kontrol panelinden ayarlayın:
   - DATABASE_URL
   - DIRECT_URL
   - JWT_SECRET
   - NEXT_PUBLIC_SITE_URL

## Yardım ve Destek

Yardıma ihtiyacınız varsa veya herhangi bir sorunla karşılaşırsanız, lütfen GitHub üzerinden bir issue açın veya doğrudan iletişime geçin.
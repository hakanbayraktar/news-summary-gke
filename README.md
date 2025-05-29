# 📰 News Summary App – GitHub Actions + ArgoCD + GKE

Bu proje; `newsapi.org` üzerinden yalnızca Amerika (US) haberlerini çeker, ve **mock özetleme**(gerçek özetleme yapılmaz; haber başlığı kullanılarak yapay bir özet üretilir) yöntemiyle özetler ve bu verileri MySQL veritabanına kaydeder. Web arayüzü üzerinden bu özetler görüntülenebilir. Uygulama Docker ile containerize edilmiştir; GKE üzerinde ArgoCD ile deploy edilir ve GitHub Actions ile CI/CD işlemleri yürütülür.

## 🔧 Kullanılan Teknolojiler

- Node.js + Express.js (Backend)
- React + Tailwind (Frontend)
- MySQL (StatefulSet olarak GKE'de)
- Docker (Backend & Frontend image’ları için)
- Kubernetes (Google Kubernetes Engine – GKE)
- GitHub Actions (CI/CD ve cron job için)
- ArgoCD (GitOps tabanlı otomatik deploy)
- newsapi.org (Haber kaynağı)

## ✅ GEREKLİ ARAÇLAR (Araç Adı, Açıklama ve İndirme Linki)
- 💻 Lokal Geliştirme ve Container Kullanımı
Node.js (18.x önerilir) – Backend geliştirme ve çalıştırma için 🔗 <https://nodejs.org>
- npm (Node Package Manager) – Node.js ile birlikte gelir
- Docker Desktop – Backend, frontend ve veritabanını container içinde çalıştırmak için 🔗 <https://www.docker.com/products/docker-desktop>
- Docker Compose – Çoklu container’ı birlikte çalıştırmak için (Docker ile birlikte gelir)
- MySQL Workbench veya DBeaver – MySQL veritabanını görsel olarak yönetmek için 🔗 <https://dev.mysql.com/downloads/workbench/> 🔗 <https://dbeaver.io/download/>

## 🛠️ DevOps Araçları
- kubectl – GKE kümesine bağlanmak için komut satırı aracı 🔗 <https://kubernetes.io/docs/tasks/tools/>
- Google Cloud SDK (gcloud) – GKE, GCR, IAM yönetimi için gerekli 🔗 <https://cloud.google.com/sdk/docs/install>
-  Git – Versiyon kontrolü için 🔗 <https://git-scm.com/downloads>
- GitHub CLI (gh) – GitHub ile komut satırından işlem yapmak için (isteğe bağlı) 🔗 <https://cli.github.com/>
-  VS Code – Kod düzenleme için 🔗 <https://code.visualstudio.com/>

## 👤 GEREKLİ HESAPLAR
- GitHub:                Kodu forkladıktan sonra kendi ortamında çalıştırmak için (CI/CD)
- Google Cloud Platform:  GKE (Google Kubernetes Engine), GCR (Container Registry), Secret, IAM kullanımı için
- NewsAPI.org          :  API key almak için, haberleri çekebilmek için

## 📁 Proje Yapısı

```
 📁 Proje Yapısı
news-summary-gke/
├── frontend/                    # React tabanlı kullanıcı arayüzü
├── src/                             # Node.js backend (Express + MySQL)
├── mysql/init.sql              # Veritabanı ve tablo oluşturma scripti
├── .github/workflows/      # GitHub Actions: CI/CD & cron-job
├── manifests/                  # Kubernetes manifest dosyaları (GKE + ArgoCD uyumlu)
├── news-app-local-dev/  # Docker Compose ile local geliştirme ortamı
├── scripts/                       # GKE & ArgoCD kurulum scriptleri
├── Dockerfile                   # Backend için production Dockerfile
└── README.md

```

## 🛠️ CI/CD Süreci

.github/workflows/ci-cd.yml

- Kod main branch’ine push edilince:
  - backend + frontend image build & push
  - deployment-*.yaml dosyalarına IMAGE_TAG eklenir (via sed)
  - ArgoCD manifest’leri commitlenip repoya push edilir
  - ArgoCD otomatik deploy işlemini başlatır

.github/workflows/fetch-news.yml
  - Her 10 dakikada bir (veya manuel tetiklenebilir):
  - Haberleri NewsAPI'den çeker
  - Basit bir mock özet üretir
  - MySQL veritabanına kayıt eder

.github/workflows/setup-ifra.yml
 - bir defaya mahsus manuel olarak çalıştırılmalıdır.
 - Bu işlem, aşağıdaki bileşenleri Kubernetes üzerine kurar:
    - 🐬 MySQL (StatefulSet + PersistentVolume) ve servisleri
    - ⚙️ Backend API servisleri
    - 🖥️ Frontend UI servisleri

## 🌐 Uygulama Nasıl Çalışır?

- GitHub Actions arka planda haberleri newsapi.org'dan alır.
- fetch-news.js scripti, newsService.js üzerinden NewsAPI ile sadece country=us için haberleri çeker.
- Veriler news tablosuna yazılır.
- Frontend tarafındaki Fetch Latest News butonu, GET /news endpointine istek atar ve veritabanındaki haberleri listeler.
- Dashboard’daki Fetch Latest News butonu doğrudan haber çekmez, sadece veritabanından gelenleri gösterir.

### Kodları Bilgisayarınıza İndirme

```bash
git clone https://github.com/hakanbayraktar/news-summary-gke.git
cd news-summary-gke
``` 

## !!!!! DEĞİŞTİRİLMESİ GEREKEN DOSYALAR ve AYARLAR !!!!!
- 🔐 news-app/news-app-local-dev/.env 

```bash
DB_HOST=db
DB_USER=root
DB_PASS=yourpassword
DB_NAME=newsdb
NEWS_API_KEY=your_news_api_key
VITE_API_URL=http://localhost:3000
```

NEWS_API_KEY: <https://newsapi.org> adresinden alınmalı

### → GitHub repo > Settings > Secrets > Actions >
- GCP_CREDENTIALS   
- DB_USER         
- DB_PASS          
- DB_NAME          
- DB_HOST_EXTERNAL
- NEWS_API_KEY       
- GH_PAT

### → GitHub repo > Settings > Variables > Actions
- GCP_PROJECT_ID 
- GKE_CLUSTER_NAME 
- GKE_REGION 
- VITE_NEWS_API_UR

### scripts/gke-setup.sh
PROJECT_ID="YOUR_PROJECT_ID"
REGION="YOUR REGION"
CLUSTER_NAME="YOUR_CLUSTER_NAME"
 
### scripts/gcp-key.json
YOUR_SERVICE_ACCOUNT_JSON

📝 Açıklama:
  - Kodları bilgisayarınıza indirdikten sonra sizin için uygun username password ve API_KEY bilgilerini değiştirdikten sonra:
  - Bilgisayarınıza da docker compose komutlarını kullanarak uygulamayı test edebilirsiniz
  - Github repository hesabınıza kodları göndererek GKE ortamına deploy edebilirsiniz

### 🐋 Docker Compose ile Localde Çalıştırmak için
Uygulamayı başlatın:

```bash
cd news-app-local-dev
cp .env.example .env  # .env ayarlarını yap
docker-compose up -d
```
Yukarıdaki komut, aşağıdaki 3 servisi başlatır:
- ✅ Node.js backend (localhost:3000)
- ✅ React frontend (localhost:5173)
- ✅ MySQL veritabanı (localhost:3306)

## 🌐 Erişim Adresleri

| Servis     | Açıklama                            | URL veya Adres            |
|------------|-------------------------------------|---------------------------|
| 🖥️ Frontend | React tabanlı kullanıcı arayüzü      | <http://localhost:5173>     |
| ⚙️ Backend  | Express.js tabanlı RESTful API      | <http://localhost:3000/news> |
| 🐬 MySQL    | Veritabanı sunucusu                 | localhost:3306            |

## MySql Erişim Bilgileri
  - Host      : `localhost:3306`
  - Kullanıcı : `root`
  - Şifre     : `my-secret-pw`
  - Veritabanı: `newsdb`

# GKE ortamına github actions ve ArgoCD kullanarak deploy etme

## ⚙️ Kurulum Adımları

## GitHub Repository ve PAT Oluşturma

- Repo adı: news-summary-gke
- Lokalden Git bağlantısı ayarla:

## GitHub Personal Access Token (PAT) Oluştur
GitHub sağ üstten → Settings → Developer settings → Personal access tokens → Tokens (classic)
Generate new token (classic) butonuna tıkla
Scope (yetkiler) kısmında şunları seç:
- repo ✅
- workflow ✅
Token’a isim ver: news-summary-deploy-token
## Token'ı GitHub Secrets Olarak Tanımla
GitHub repo → Settings → Secrets and variables → Actions → Secrets → New repository secret
- Name: GH_PAT
- Value: Az önce oluşturduğun token
## Workflow permission yetkisi
GitHub repo →Settings->Actions->General->Workflow permissions->Read and write permissions->Save

##  GCP Projesi Oluştur

- Yeni bir GCP projesi oluştur.
- Aşağıdaki servisleri etkinleştir:
  - Kubernetes Engine API
  - Artifact Registry API
- Service Account oluştur ve Editor + Kubernetes Engine Admin rollerini ver.
- JSON key indir → GCP_CREDENTIALS olarak GitHub'a ekle.
## Artifact Registry Reposu Oluştur
GCP Console → <https://console.cloud.google.com/artifacts>
Sol menüden: Repositories → + CREATE REPOSITORY
Aşağıdaki alanları doldur:
✅ Name: news-app
✅ Format: Docker
✅ Mode: Standard
✅ Location Type: Region
✅ Region: us-central1
✅ Encryption: Google-managed
✅ Immutable image tags: Disabled
✅ Cleanup: Dry run
✅ Vulnerability scanning: Enabled

## GKE Cluster Kurulumu

```bash
cd news-summary-gke/scripts
bash gke-setup.sh
```

## ArgoCD Kurulumu

```bash
# news-summary-gke/scripts klasörü içindeyken
bash argocd-install.sh
```

## ArgoCD Application Tanımı
Projenin manifests/argocd-app.yaml dosyasında ArgoCD'nin GitHub repository’sini izlemesi sağlanır.
- repoURL: Projenizin Github repository adresi
- path       : manifests


## 🔄  GitHub Repo Yapılandırması
→ GitHub repo > Settings > Secrets and variables  > Actions > Secrets
### 🔐 Gerekli GitHub Secrets

| Secret             | Açıklama                              |
|--------------------|---------------------------------------|
| `GCP_CREDENTIALS`  | GCP servis hesabı JSON (string hali)  |
| `DB_USER`          | MySQL kullanıcı adı                   |
| `DB_PASS`          | MySQL şifresi                         |
| `DB_NAME`          | MySQL veritabanı adı                  |
| `NEWS_API_KEY`     | NEWS API anahtarınız                  |
| `DB_HOST_EXTERNAL` | MySQl Nodeport IP+ port 30306         |
| `GH_PAT`           | GitHub Personal Access Token (workflow + repo) izinleri açık olmalı
→ GitHub repo > Settings > Secrets and variables  > Actions > Variables
.
### 🔐 Gerekli GitHub Variables

| Variables           | Açıklama                              |
|---------------------|---------------------------------------|
| `GCP_PROJECT_ID`    | GCP projenizin ID’si                  |
| `GKE_CLUSTER_NAME`  | GKE cluster adı                       |
| `GKE_REGION`        | GKE cluster bölgesi                   |
| `VITE_NEWS_API_URL` | Backend News servis          |

### ✅ CI/CD – `.github/workflows/ci-cd.yml`

- Push olduğunda:
  - Docker image oluşturur
  - GCR'a gönderir
  - `app-secrets.yaml` dosyasını secret’lardan oluşturur
  - `kubectl apply` ile GKE’ye sadece secret’ı gönderir
  - Deployment işlemleri ArgoCD tarafından yapılır

### 🕒 Cron – `.github/workflows/fetch-news.yml`

- Günde 2 kez çalışır
- Haberleri OpenAI ile özetler
- Veritabanına kaydeder
- **MySQL'e bağlanmak için dış IP (Node IP) ve `mysql-nodeport` servisi kullanılır**

### – `.github/workflows/setup-infra.yml`

### Kodları GitHub Reposuna Gönderme
Kodları göndermeden önce Deployment Dosyalarında Docker Image Güncellenmeli
📄 manifests/deployment-backend.yaml
📄 manifests/deployment-frontend.yaml

```bash
rm -rf .git
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/username/news-summary-gke-test.git
git push -u origin main
```

### CI/CD Workflow ile Altyapının Kurulmas
Kodlar GitHub’a push edildikten ve gerekli Secrets ile Variables tanımlandıktan sonra, altyapının kurulmasını sağlayan .github/workflows/setup-infra.yml dosyası bir defaya mahsus manuel olarak çalıştırılmalıdır.

```bash
kubectl get svc
```

NAME             TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)          AGE
mysql-nodepport  NodePort       34.118.238.93    <none>          3306:30306/TCP   15h
news-frontend    LoadBalancer   34.118.233.22    34.28.153.207   80:31264/TCP     17h
news-service     LoadBalancer   34.118.227.166   34.173.62.102   80:30428/TCP     15h


## 🌐 GKE içindeki Servislere Erişim Adresleri

| Servis     | Açıklama                  | URL veya Adres                 |
|------------|---------------------------|-------------------------------|
| 🖥️ Frontend | news-frontend             | <http://34.28.153.207>          |
| ⚙️ Backend  | news-service              | <http://34.173.62.102/news>     |
| 🐬 MySQL    | NodePort üzerinden erişim | 34.118.238.93:30306             |
📝 Açıklama:

- news-frontend: React arayüzüne erişim sağlar
- news-service: Express backend API erişimi (/news endpointiyle)
### API ve Frontend Testi
✅ Backend: <http://34.173.62.102/news>
✅ Frontend: <http://34.28.153.207>

⚠️  Frontend'e Haberlerin Gelebilmesi İçin
Aşağıdaki GitHub yapılandırma değerleri güncellenmelidir:
Variables

VITE_NEWS_API_URL=<http://34.173.193.11>
GitHub Actions üzerinden CI/CD workflow manuel olarak veya push ile tetiklenebilir.

## 📝 Lisans

MIT Lisansı © 2025  
Hazırlayan: [@hakanbayraktar](https://github.com/hakanbayraktar)

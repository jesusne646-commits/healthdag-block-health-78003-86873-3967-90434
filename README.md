# HealthDAG 🏥⛓️

A decentralized healthcare data management platform built on BlockDAG technology, enabling secure, transparent, and patient-controlled medical records.

![HealthDAG](https://img.shields.io/badge/blockchain-BlockDAG-blue)
![React](https://img.shields.io/badge/react-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Overview

HealthDAG revolutionizes healthcare data management by leveraging blockchain technology to create a secure, decentralized, and patient-centric medical records system. Patients maintain full control over their health data while enabling seamless, secure sharing with healthcare providers.

## ✨ Key Features

### 🔐 Security & Privacy
- **End-to-End Encryption**: Military-grade encryption for all medical records
- **Blockchain Immutability**: Tamper-proof audit trails using BlockDAG technology
- **Zero-Knowledge Architecture**: Patient data remains private and secure
- **Granular Access Control**: Patients control exactly who sees what

### 👤 Patient Portal
- **Digital Medical Records**: Store and manage all health records in one place
- **QR Code Sharing**: Instant, secure sharing via QR codes
- **Access Management**: Real-time approval/revocation of data access
- **Activity Monitoring**: Complete audit trail of who accessed your data
- **Emergency Access**: Pre-configured emergency contact access protocols

### 👨‍⚕️ Healthcare Provider Dashboard
- **QR Code Scanner**: Instant access request via patient QR codes
- **Secure Data Access**: Cryptographically signed access grants
- **Real-time Notifications**: Instant updates on access approvals
- **Medical Records Viewer**: Clean interface for viewing patient data
- **Access History**: Complete log of data access events

### 💰 Blockchain Features
- **BlockDAG Wallet Integration**: MetaMask-compatible wallet support
- **BDAG Token Utility**: Native token for platform services
- **Transparent Transactions**: All access events recorded on-chain
- **Donation Platform**: Support healthcare initiatives with BDAG

### 🤖 AI-Powered Assistance
- **Medical AI Chat**: Get instant answers to health questions
- **Document Analysis**: AI-powered medical record summarization
- **Symptom Checker**: Intelligent symptom assessment
- **Treatment Recommendations**: Evidence-based health guidance

### 📱 Additional Features
- **Multi-language Support**: English and Arabic interfaces
- **Dark/Light Mode**: Comfortable viewing in any environment
- **Responsive Design**: Seamless experience across all devices
- **Insurance Integration**: Direct insurance claims processing
- **Appointment Management**: Schedule and track medical appointments
- **Bill Payment**: Integrated medical billing system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Modern web browser (Chrome, Firefox, Edge)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/healthdag.git
cd healthdag
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
```
Navigate to http://localhost:5173
```

## 🏗️ Technology Stack

### Frontend
- **React 18.3**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful component library
- **TanStack Query**: Powerful data fetching

### Backend & Database
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Robust relational database
- **Edge Functions**: Serverless compute
- **Real-time Subscriptions**: Live data updates

### Blockchain & Web3
- **MetaMask**: Wallet integration
- **BlockDAG Network**: Decentralized ledger
- **Web3 APIs**: Blockchain interactions
- **QR Code Technology**: Secure data sharing

### AI & ML
- **OpenAI GPT**: Advanced language models
- **Google Gemini**: Multimodal AI capabilities
- **Medical AI Models**: Specialized healthcare AI

### Additional Tools
- **React Router**: Client-side routing
- **Zod**: Schema validation
- **React Hook Form**: Form management
- **Recharts**: Data visualization
- **html5-qrcode**: QR scanning functionality

## 📖 Usage

### For Patients

1. **Create Account**: Sign up with email and create your wallet
2. **Upload Records**: Add your medical records securely
3. **Generate QR Code**: Create shareable QR codes for your data
4. **Manage Access**: Approve or deny access requests in real-time
5. **Monitor Activity**: Track all access to your medical data

### For Healthcare Providers

1. **Register**: Create a healthcare provider account
2. **Scan QR Code**: Use the built-in scanner to request access
3. **View Records**: Access approved patient medical records
4. **Maintain History**: All interactions logged for compliance

### For Developers

```typescript
// Example: Fetching medical records
import { supabase } from "@/integrations/supabase/client";

const fetchRecords = async (userId: string) => {
  const { data, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("user_id", userId);
  
  return data;
};
```

## 🔒 Security Features

- **Row-Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure session management
- **Encrypted Storage**: All data encrypted at rest
- **Audit Logging**: Complete activity tracking
- **Access Revocation**: Instant access termination
- **Smart Contract Security**: Audited blockchain contracts

## 🌐 Deployment

### Production Build

```bash
npm run build
```

### Environment Configuration

Required environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- BlockDAG Network for blockchain infrastructure
- Supabase for backend services
- shadcn/ui for beautiful components
- OpenAI and Google for AI capabilities
- The open-source community

## 📧 Contact & Support

- **Website**: https://healthdag.io
- **Email**: support@healthdag.io
- **Twitter**: @HealthDAG
- **Discord**: https://discord.gg/healthdag

## 🗺️ Roadmap

- [ ] Mobile applications (iOS/Android)
- [ ] Multi-chain support
- [ ] Advanced AI diagnostics
- [ ] Telemedicine integration
- [ ] Lab results automation
- [ ] Prescription management
- [ ] Health analytics dashboard
- [ ] International compliance (HIPAA, GDPR)

## ⚠️ Disclaimer

HealthDAG is a healthcare data management platform. Always consult with qualified healthcare professionals for medical advice. This platform is not a substitute for professional medical consultation, diagnosis, or treatment.

---

**Built with ❤️ by the HealthDAG Team**

*Empowering patients, securing data, revolutionizing healthcare.*

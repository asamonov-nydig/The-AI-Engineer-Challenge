# LLM Chat Frontend

A beautiful Next.js frontend for your FastAPI LLM backend.

## Features

- 🎨 Modern, responsive UI with glassmorphism design
- 🔍 Real-time backend health monitoring
- 💬 Streaming chat responses with markdown support
- ⚙️ Configurable OpenAI models and system messages
- 🎯 Error handling and loading states
- 📱 Mobile-friendly interface

## Quick Start

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Backend URL
- Default: `http://localhost:8000`
- Change in the interface or set via environment variable

### OpenAI API Key
- Enter your OpenAI API key in the configuration panel
- The key is not stored and only sent to your backend

### Supported Models
- GPT-4o Mini (default)
- GPT-4o
- GPT-4 Turbo
- GPT-3.5 Turbo

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Features in Detail

### Health Monitoring
- Real-time backend status checking
- Visual indicators for online/offline status
- Manual health check button

### Chat Interface
- Streaming responses for real-time conversation
- Markdown rendering with syntax highlighting
- Message timestamps
- Error handling with user-friendly messages

### Configuration Panel
- OpenAI API key input (secure)
- Model selection dropdown
- System/Developer message customization
- Chat clearing functionality

## Deployment

This frontend is configured to work with Vercel out of the box. The `vercel.json` in the root directory handles both frontend and backend deployment.

```bash
# Deploy to Vercel
vercel
```

## Customization

### Styling
- Uses Tailwind CSS for responsive design
- Custom glass-effect components
- AI-themed color palette
- Easy to customize in `globals.css`

### Components
- Modular React components
- TypeScript for type safety
- Modern React hooks patterns
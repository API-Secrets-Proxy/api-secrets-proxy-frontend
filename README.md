# ProxLock Frontend

The web application frontend for **ProxLock**, a secure API secrets proxy service. This is a modern React application built with TypeScript, Vite, and Clerk authentication.

## 🚀 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Clerk** - Authentication
- **React Router** - Client-side routing
- **Cloudflare Workers** - Deployment platform

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js) or **yarn**
- A **Clerk** account and publishable key (for authentication)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd api-secrets-proxy-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env  # If an example exists, or create manually
```

Add your Clerk publishable key and the api server's url:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
VITE_API_URL=http://127.0.0.1:8080
```

You can obtain your Clerk publishable key from your [Clerk Dashboard](https://dashboard.clerk.com/).

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### 5. Build for Production

```bash
npm run build
```

This will create an optimized production build in the `dist` directory.

### 6. Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## 📁 Project Structure

```
src/
├── assets/          # Static assets (images, icons, etc.)
├── components/      # Reusable React components
│   ├── ErrorToast.tsx
│   ├── Sidebar.tsx
│   ├── UpgradeBanner.tsx
│   └── UsageAlert.tsx
├── contexts/        # React context providers
│   └── ProjectsContext.tsx
├── pages/           # Page components
│   ├── DashboardPage.tsx
│   ├── HomePage.tsx
│   ├── NotFoundPage.tsx
│   └── PricingPage.tsx
├── App.css          # Global styles
├── AuthRouter.tsx   # Authentication routing logic
├── index.css        # Base styles
└── main.tsx         # Application entry point
```

## 🧪 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check code quality

## 🤝 Contributing

We welcome contributions to ProxLock! Here's how you can help:

### Getting Started

1. **Fork the repository** and clone your fork
2. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
3. **Make your changes** following the project's coding standards
4. **Test your changes** thoroughly
5. **Commit your changes** with clear, descriptive commit messages
6. **Push to your fork** and create a Pull Request

### Code Style Guidelines

- Follow the existing code style and patterns
- Use TypeScript for all new code
- Write meaningful component and variable names
- Add comments for complex logic
- Ensure your code passes linting: `npm run lint`

### Pull Request Process

1. Ensure your branch is up to date with the main branch
2. Make sure all tests pass and linting is clean
3. Write a clear description of your changes in the PR
4. Reference any related issues in your PR description
5. Request review from maintainers

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists
2. Create a new issue with:
   - A clear, descriptive title
   - Steps to reproduce (for bugs)
   - Expected vs. actual behavior
   - Screenshots if applicable
   - Your environment details (OS, Node version, etc.)

## 📝 License

See the [License](License) file for details.

## 🔗 Related Links

- [ProxLock Documentation](https://docs.proxlock.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)


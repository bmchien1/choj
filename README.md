# Choj

## Overview
Choj is a web application designed for automated code grading and testing, similar to platforms like LeetCode. Built using a modern frontend stack, the app provides a streamlined interface for coding problems, submissions, and performance tracking.
Currently, two official plugins are available:

## Getting Started
1. Clone the repository
```bash
git clone https://github.com/bmchien1/choj.git
```

2. Install dependencies
```bash
cd choj
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Tech Stack:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Antd](https://ant.design/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query](https://react-query.tanstack.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Zustand](https://zustand.surge.sh/)

## Template Structure:
- `src`: Contains the source code of the frontend
    - `apis`: Contains the API services and configurations
    - `components`: Contains the reusable components
    - `constants`: Contains the constant values and types
    - `hooks`: Contains the custom hooks
    - `layouts`: Contains the layout components
    - `pages`: Contains the page components. Each page is a route in the application
    - `providers`: Contains some providers such as ThemeProvider, QueryClientProvider, etc.
    - `routes`: Contains the route configurations
    - `themes`: Contains the theme configurations
    - `utils`: Contains the utility functions
    - `App.tsx`: The root component of the application
    - `index.tsx`: The entry point of the application
- `.env`: Contains the environment variables
```

## NOTE:

- The variables in the `.env` file should be prefixed with `VITE_` to be accessible in the application.

# Secure Site

This is a React application built with Vite, featuring a responsive design, dark theme support, and internationalization capabilities.

## Features

- **Responsive Design**: The application adapts to different screen sizes using custom hooks and CSS classes.
- **Dark Theme**: Users can switch between light and dark themes.
- **Internationalization**: Supports multiple languages, currently English and Arabic.

## Project Structure

```
secure-site
├── public
│   ├── index.html
│   └── locales
│       ├── en.json
│       └── es.json
├── src
│   ├── assets
│   │   └── images
│   ├── components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── NavLink.tsx
│   ├── contexts
│   │   └── LanguageContext.tsx
│   ├── hooks
│   │   └── useResponsive.tsx
│   ├── pages
│   │   ├── Dashboard.tsx
│   │   ├── Profiles.tsx
│   │   ├── Contacts.tsx
│   │   ├── Reports.tsx
│   │   ├── Invoices.tsx
│   │   └── Products.tsx
│   ├── styles
│   │   ├── theme.ts
│   │   └── global.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd secure-site
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`.

## Customization

- **Themes**: Modify the theme settings in `src/styles/theme.ts` to customize colors and typography.
- **Languages**: Add new languages by creating additional JSON files in the `public/locales` directory and updating the `LanguageContext`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
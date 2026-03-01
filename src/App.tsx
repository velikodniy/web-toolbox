import { Suspense, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FaGithub, FaMoon, FaSun } from 'react-icons/fa';
import { HiExternalLink } from 'react-icons/hi';
import Home from './pages/Home.tsx';
import { tools } from './tools.ts';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof document !== 'undefined') {
    return document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light';
  }
  return 'light';
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <Toaster
        position='top-right'
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
        }}
      />
      <div>
        <header className='header'>
          <div className='container'>
            <div className='header-content'>
              <Link to='/' className='logo'>
                Toolbox
              </Link>
              <nav className='nav'>
                <button
                  type='button'
                  onClick={toggleTheme}
                  className='theme-toggle'
                  aria-label='Toggle theme'
                  title={`Switch to ${
                    theme === 'light' ? 'dark' : 'light'
                  } mode`}
                >
                  {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>
                <a
                  href='https://github.com/velikodniy/web-toolbox'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='nav-link flex-center gap-half'
                >
                  <FaGithub />
                  GitHub
                  <HiExternalLink size={14} />
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main className='main'>
          <div className='container'>
            <Routes>
              <Route path='/' element={<Home />} />
              {tools.map((tool) => (
                <Route
                  key={tool.path}
                  path={tool.path}
                  element={
                    <Suspense fallback={null}>
                      <tool.component />
                    </Suspense>
                  }
                />
              ))}
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;

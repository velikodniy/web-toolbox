import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FaGithub, FaMoon, FaSun } from 'react-icons/fa';
import { HiExternalLink } from 'react-icons/hi';
import Home from './pages/Home.tsx';
import UUIDGenerator from './pages/UUIDGenerator.tsx';
import Base64Tool from './pages/Base64Tool.tsx';
import JSONFormatter from './pages/JSONFormatter.tsx';
import URLEncoder from './pages/URLEncoder.tsx';
import HashGenerator from './pages/HashGenerator.tsx';

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
                  type="button"
                  onClick={toggleTheme}
                  className='theme-toggle'
                  aria-label='Toggle theme'
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>
                <a
                  href='https://github.com/velikodniy/web-toolbox'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='nav-link'
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
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
              <Route path='/uuid-generator' element={<UUIDGenerator />} />
              <Route path='/base64-tool' element={<Base64Tool />} />
              <Route path='/json-formatter' element={<JSONFormatter />} />
              <Route path='/url-encoder' element={<URLEncoder />} />
              <Route path='/hash-generator' element={<HashGenerator />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;

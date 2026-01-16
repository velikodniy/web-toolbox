import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FaGithub, FaMoon, FaSun } from 'react-icons/fa';
import { HiExternalLink } from 'react-icons/hi';
import Home from './pages/Home.tsx';
import Base64Tool from './features/base64/Base64Tool.tsx';
import URLEncoder from './features/url-encoder/URLEncoder.tsx';
import HashGenerator from './features/hash/HashGenerator.tsx';
import JSONFormatter from './features/json/JSONFormatter.tsx';
import PostcodeLookup from './features/postcode/PostcodeLookup.tsx';
import UUIDTool from './features/uuid/UUIDTool.tsx';
import GPXDrawTool from './features/gpx/GPXDrawTool.tsx';
import PasswordGenerator from './features/password/PasswordGenerator.tsx';

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
              <Route path='/uuid' element={<UUIDTool />} />
              <Route path='/base64-tool' element={<Base64Tool />} />
              <Route path='/json-formatter' element={<JSONFormatter />} />
              <Route path='/url-encoder' element={<URLEncoder />} />
              <Route path='/hash-generator' element={<HashGenerator />} />
              <Route path='/postcode-lookup' element={<PostcodeLookup />} />
              <Route path='/gpx-draw' element={<GPXDrawTool />} />
              <Route
                path='/password-generator'
                element={<PasswordGenerator />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;

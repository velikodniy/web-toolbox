import React from 'react';
import { Link } from 'react-router-dom';
import { FiKey, FiCode, FiAlignLeft, FiLink, FiShield } from 'react-icons/fi';

const Home: React.FC = () => {
  const tools = [
    {
      name: 'UUID Generator',
      description:
        'Generate unique identifiers (UUID v4) for your applications',
      path: '/uuid-generator',
      icon: <FiKey />,
    },
    {
      name: 'Base64 Encoder/Decoder',
      description: 'Encode and decode text to/from Base64 format',
      path: '/base64-tool',
      icon: <FiCode />,
    },
    {
      name: 'JSON Formatter',
      description: 'Format, validate, and beautify JSON data',
      path: '/json-formatter',
      icon: <FiAlignLeft />,
    },
    {
      name: 'URL Encoder/Decoder',
      description: 'Encode and decode URLs for safe transmission',
      path: '/url-encoder',
      icon: <FiLink />,
    },
    {
      name: 'Hash Generator',
      description: 'Generate SHA-1 and SHA-256 hashes from text',
      path: '/hash-generator',
      icon: <FiShield />,
    },
  ];

  return (
    <div>
      <section className='hero'>
        <h1>Toolbox</h1>
        <p>
          A collection of essential tools for software engineers and developers.
          Simple, fast, and completely client-side.
        </p>
      </section>

      <section className='tools-grid'>
        {tools.map((tool) => (
          <Link key={tool.path} to={tool.path} className='tool-card'>
            <div className='tool-card-icon'>{tool.icon}</div>
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Home;

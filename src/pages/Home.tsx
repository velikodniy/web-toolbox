import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlignLeft,
  FiCode,
  FiKey,
  FiLink,
  FiMap,
  FiMapPin,
  FiShield,
} from 'react-icons/fi';

const Home: React.FC = () => {
  const tools = [
    {
      name: 'UUID Tool',
      description: 'Generate and analyze UUIDs',
      path: '/uuid',
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
    {
      name: 'Postcode Lookup',
      description: 'Lookup UK postcodes, coordinates and administrative data',
      path: '/postcode-lookup',
      icon: <FiMapPin />,
    },
    {
      name: 'GPX Draw Tool',
      description: 'Draw markers and polylines on a map and export as GPX',
      path: '/gpx-draw',
      icon: <FiMap />,
    },
  ];

  return (
    <div>
      <section className='hero'>
        <h1>Toolbox</h1>
        <p>
          A collection of essential tools. Simple, fast, and completely
          client-side.
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

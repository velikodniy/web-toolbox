import React from 'react';
import { Link } from 'react-router-dom';
import { tools } from '../tools.ts';

const Home: React.FC = () => {
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

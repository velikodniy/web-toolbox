import React from 'react';
import {
  BidirectionalConverter,
  ToolPageLayout,
} from '../../components/ui/index.ts';

const encode = (input: string) => {
  try {
    return { success: true as const, value: encodeURIComponent(input) };
  } catch {
    return { success: false as const, error: 'Failed to encode.' };
  }
};

const decode = (input: string) => {
  try {
    return { success: true as const, value: decodeURIComponent(input) };
  } catch {
    return { success: false as const, error: 'Invalid URL encoding.' };
  }
};

const URLEncoder: React.FC = () => {
  return (
    <ToolPageLayout
      title='URL Encoder/Decoder'
      description='Real-time bidirectional URL encoding/decoding.'
    >
      <BidirectionalConverter
        encode={encode}
        decode={decode}
        labels={{ decoded: 'Decoded URL', encoded: 'Encoded URL' }}
        placeholders={{
          decoded: 'Type decoded URL here... (e.g., https://example.com/foo bar)',
          encoded: 'Type encoded URL here... (e.g., https%3A%2F%2Fexample.com%2Ffoo%20bar)',
        }}
      />
    </ToolPageLayout>
  );
};

export default URLEncoder;

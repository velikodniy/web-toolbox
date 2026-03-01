import React from 'react';
import {
  BidirectionalConverter,
  ToolPageLayout,
} from '../../components/ui/index.ts';
import type { Result } from '../../lib/result.ts';

const encode = (input: string): Result<string> => {
  try {
    return { success: true, data: btoa(input) };
  } catch {
    return { success: false, error: 'Failed to encode.' };
  }
};

const decode = (input: string): Result<string> => {
  try {
    return { success: true, data: atob(input) };
  } catch {
    return { success: false, error: 'Invalid Base64 string.' };
  }
};

const Base64Tool: React.FC = () => {
  return (
    <ToolPageLayout
      title='Base64 Encoder/Decoder'
      description='Real-time bidirectional Base64 conversion. Type in either box to convert.'
    >
      <BidirectionalConverter
        encode={encode}
        decode={decode}
        labels={{ decoded: 'Text / Raw', encoded: 'Base64' }}
        placeholders={{
          decoded: 'Type text here...',
          encoded: 'Type Base64 here...',
        }}
      />
    </ToolPageLayout>
  );
};

export default Base64Tool;
